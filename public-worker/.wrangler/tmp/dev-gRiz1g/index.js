var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .wrangler/tmp/bundle-YRAKNw/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
var init_strip_cf_connecting_ip_header = __esm({
  ".wrangler/tmp/bundle-YRAKNw/strip-cf-connecting-ip-header.js"() {
    "use strict";
    __name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader.apply(null, argArray)
        ]);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// node_modules/.pnpm/wrangler@3.114.15/node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/.pnpm/wrangler@3.114.15/node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.js
var require_tslib = __commonJS({
  "node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.js"(exports, module) {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    var __extends;
    var __assign;
    var __rest;
    var __decorate;
    var __param;
    var __esDecorate;
    var __runInitializers;
    var __propKey;
    var __setFunctionName;
    var __metadata;
    var __awaiter;
    var __generator;
    var __exportStar;
    var __values;
    var __read;
    var __spread;
    var __spreadArrays;
    var __spreadArray;
    var __await;
    var __asyncGenerator;
    var __asyncDelegator;
    var __asyncValues;
    var __makeTemplateObject;
    var __importStar;
    var __importDefault;
    var __classPrivateFieldGet;
    var __classPrivateFieldSet;
    var __classPrivateFieldIn;
    var __createBinding;
    var __addDisposableResource;
    var __disposeResources;
    var __rewriteRelativeImportExtension;
    (function(factory) {
      var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
      if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function(exports2) {
          factory(createExporter(root, createExporter(exports2)));
        });
      } else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
      } else {
        factory(createExporter(root));
      }
      function createExporter(exports2, previous) {
        if (exports2 !== root) {
          if (typeof Object.create === "function") {
            Object.defineProperty(exports2, "__esModule", { value: true });
          } else {
            exports2.__esModule = true;
          }
        }
        return function(id, v) {
          return exports2[id] = previous ? previous(id, v) : v;
        };
      }
      __name(createExporter, "createExporter");
    })(function(exporter) {
      var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p))
            d[p] = b[p];
      };
      __extends = /* @__PURE__ */ __name(function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        __name(__, "__");
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      }, "__extends");
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      __rest = /* @__PURE__ */ __name(function(s, e) {
        var t = {};
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
          }
        return t;
      }, "__rest");
      __decorate = /* @__PURE__ */ __name(function(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          r = Reflect.decorate(decorators, target, key, desc);
        else
          for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
              r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
      }, "__decorate");
      __param = /* @__PURE__ */ __name(function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      }, "__param");
      __esDecorate = /* @__PURE__ */ __name(function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) {
          if (f !== void 0 && typeof f !== "function")
            throw new TypeError("Function expected");
          return f;
        }
        __name(accept, "accept");
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
          var context = {};
          for (var p in contextIn)
            context[p] = p === "access" ? {} : contextIn[p];
          for (var p in contextIn.access)
            context.access[p] = contextIn.access[p];
          context.addInitializer = function(f) {
            if (done)
              throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
          };
          var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
          if (kind === "accessor") {
            if (result === void 0)
              continue;
            if (result === null || typeof result !== "object")
              throw new TypeError("Object expected");
            if (_ = accept(result.get))
              descriptor.get = _;
            if (_ = accept(result.set))
              descriptor.set = _;
            if (_ = accept(result.init))
              initializers.unshift(_);
          } else if (_ = accept(result)) {
            if (kind === "field")
              initializers.unshift(_);
            else
              descriptor[key] = _;
          }
        }
        if (target)
          Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
      }, "__esDecorate");
      __runInitializers = /* @__PURE__ */ __name(function(thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
          value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
      }, "__runInitializers");
      __propKey = /* @__PURE__ */ __name(function(x) {
        return typeof x === "symbol" ? x : "".concat(x);
      }, "__propKey");
      __setFunctionName = /* @__PURE__ */ __name(function(f, name, prefix) {
        if (typeof name === "symbol")
          name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
      }, "__setFunctionName");
      __metadata = /* @__PURE__ */ __name(function(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(metadataKey, metadataValue);
      }, "__metadata");
      __awaiter = /* @__PURE__ */ __name(function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        __name(adopt, "adopt");
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          __name(fulfilled, "fulfilled");
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          __name(rejected, "rejected");
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          __name(step, "step");
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      }, "__awaiter");
      __generator = /* @__PURE__ */ __name(function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
        return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        __name(verb, "verb");
        function step(op) {
          if (f)
            throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                return t;
              if (y = 0, t)
                op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2])
                    _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5)
            throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
        __name(step, "step");
      }, "__generator");
      __exportStar = /* @__PURE__ */ __name(function(m, o) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
            __createBinding(o, m, p);
      }, "__exportStar");
      __createBinding = Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      };
      __values = /* @__PURE__ */ __name(function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
          return m.call(o);
        if (o && typeof o.length === "number")
          return {
            next: function() {
              if (o && i >= o.length)
                o = void 0;
              return { value: o && o[i++], done: !o };
            }
          };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }, "__values");
      __read = /* @__PURE__ */ __name(function(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
          return o;
        var i = m.call(o), r, ar = [], e;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
            ar.push(r.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            if (r && !r.done && (m = i["return"]))
              m.call(i);
          } finally {
            if (e)
              throw e.error;
          }
        }
        return ar;
      }, "__read");
      __spread = /* @__PURE__ */ __name(function() {
        for (var ar = [], i = 0; i < arguments.length; i++)
          ar = ar.concat(__read(arguments[i]));
        return ar;
      }, "__spread");
      __spreadArrays = /* @__PURE__ */ __name(function() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
          s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
          for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
        return r;
      }, "__spreadArrays");
      __spreadArray = /* @__PURE__ */ __name(function(to, from, pack) {
        if (pack || arguments.length === 2)
          for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
              if (!ar)
                ar = Array.prototype.slice.call(from, 0, i);
              ar[i] = from[i];
            }
          }
        return to.concat(ar || Array.prototype.slice.call(from));
      }, "__spreadArray");
      __await = /* @__PURE__ */ __name(function(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
      }, "__await");
      __asyncGenerator = /* @__PURE__ */ __name(function(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
          return this;
        }, i;
        function awaitReturn(f) {
          return function(v) {
            return Promise.resolve(v).then(f, reject);
          };
        }
        __name(awaitReturn, "awaitReturn");
        function verb(n, f) {
          if (g[n]) {
            i[n] = function(v) {
              return new Promise(function(a, b) {
                q.push([n, v, a, b]) > 1 || resume(n, v);
              });
            };
            if (f)
              i[n] = f(i[n]);
          }
        }
        __name(verb, "verb");
        function resume(n, v) {
          try {
            step(g[n](v));
          } catch (e) {
            settle(q[0][3], e);
          }
        }
        __name(resume, "resume");
        function step(r) {
          r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
        }
        __name(step, "step");
        function fulfill(value) {
          resume("next", value);
        }
        __name(fulfill, "fulfill");
        function reject(value) {
          resume("throw", value);
        }
        __name(reject, "reject");
        function settle(f, v) {
          if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]);
        }
        __name(settle, "settle");
      }, "__asyncGenerator");
      __asyncDelegator = /* @__PURE__ */ __name(function(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function(e) {
          throw e;
        }), verb("return"), i[Symbol.iterator] = function() {
          return this;
        }, i;
        function verb(n, f) {
          i[n] = o[n] ? function(v) {
            return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
          } : f;
        }
        __name(verb, "verb");
      }, "__asyncDelegator");
      __asyncValues = /* @__PURE__ */ __name(function(o) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
          return this;
        }, i);
        function verb(n) {
          i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
              v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
          };
        }
        __name(verb, "verb");
        function settle(resolve, reject, d, v) {
          Promise.resolve(v).then(function(v2) {
            resolve({ value: v2, done: d });
          }, reject);
        }
        __name(settle, "settle");
      }, "__asyncValues");
      __makeTemplateObject = /* @__PURE__ */ __name(function(cooked, raw2) {
        if (Object.defineProperty) {
          Object.defineProperty(cooked, "raw", { value: raw2 });
        } else {
          cooked.raw = raw2;
        }
        return cooked;
      }, "__makeTemplateObject");
      var __setModuleDefault = Object.create ? function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      } : function(o, v) {
        o["default"] = v;
      };
      var ownKeys = /* @__PURE__ */ __name(function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2)
            if (Object.prototype.hasOwnProperty.call(o2, k))
              ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      }, "ownKeys");
      __importStar = /* @__PURE__ */ __name(function(mod) {
        if (mod && mod.__esModule)
          return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++)
            if (k[i] !== "default")
              __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      }, "__importStar");
      __importDefault = /* @__PURE__ */ __name(function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      }, "__importDefault");
      __classPrivateFieldGet = /* @__PURE__ */ __name(function(receiver, state, kind, f) {
        if (kind === "a" && !f)
          throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
          throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
      }, "__classPrivateFieldGet");
      __classPrivateFieldSet = /* @__PURE__ */ __name(function(receiver, state, value, kind, f) {
        if (kind === "m")
          throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
          throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
          throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
      }, "__classPrivateFieldSet");
      __classPrivateFieldIn = /* @__PURE__ */ __name(function(state, receiver) {
        if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function")
          throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
      }, "__classPrivateFieldIn");
      __addDisposableResource = /* @__PURE__ */ __name(function(env, value, async) {
        if (value !== null && value !== void 0) {
          if (typeof value !== "object" && typeof value !== "function")
            throw new TypeError("Object expected.");
          var dispose, inner;
          if (async) {
            if (!Symbol.asyncDispose)
              throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
          }
          if (dispose === void 0) {
            if (!Symbol.dispose)
              throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async)
              inner = dispose;
          }
          if (typeof dispose !== "function")
            throw new TypeError("Object not disposable.");
          if (inner)
            dispose = /* @__PURE__ */ __name(function() {
              try {
                inner.call(this);
              } catch (e) {
                return Promise.reject(e);
              }
            }, "dispose");
          env.stack.push({ value, dispose, async });
        } else if (async) {
          env.stack.push({ async: true });
        }
        return value;
      }, "__addDisposableResource");
      var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
      };
      __disposeResources = /* @__PURE__ */ __name(function(env) {
        function fail(e) {
          env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
          env.hasError = true;
        }
        __name(fail, "fail");
        var r, s = 0;
        function next() {
          while (r = env.stack.pop()) {
            try {
              if (!r.async && s === 1)
                return s = 0, env.stack.push(r), Promise.resolve().then(next);
              if (r.dispose) {
                var result = r.dispose.call(r.value);
                if (r.async)
                  return s |= 2, Promise.resolve(result).then(next, function(e) {
                    fail(e);
                    return next();
                  });
              } else
                s |= 1;
            } catch (e) {
              fail(e);
            }
          }
          if (s === 1)
            return env.hasError ? Promise.reject(env.error) : Promise.resolve();
          if (env.hasError)
            throw env.error;
        }
        __name(next, "next");
        return next();
      }, "__disposeResources");
      __rewriteRelativeImportExtension = /* @__PURE__ */ __name(function(path, preserveJsx) {
        if (typeof path === "string" && /^\.\.?\//.test(path)) {
          return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
          });
        }
        return path;
      }, "__rewriteRelativeImportExtension");
      exporter("__extends", __extends);
      exporter("__assign", __assign);
      exporter("__rest", __rest);
      exporter("__decorate", __decorate);
      exporter("__param", __param);
      exporter("__esDecorate", __esDecorate);
      exporter("__runInitializers", __runInitializers);
      exporter("__propKey", __propKey);
      exporter("__setFunctionName", __setFunctionName);
      exporter("__metadata", __metadata);
      exporter("__awaiter", __awaiter);
      exporter("__generator", __generator);
      exporter("__exportStar", __exportStar);
      exporter("__createBinding", __createBinding);
      exporter("__values", __values);
      exporter("__read", __read);
      exporter("__spread", __spread);
      exporter("__spreadArrays", __spreadArrays);
      exporter("__spreadArray", __spreadArray);
      exporter("__await", __await);
      exporter("__asyncGenerator", __asyncGenerator);
      exporter("__asyncDelegator", __asyncDelegator);
      exporter("__asyncValues", __asyncValues);
      exporter("__makeTemplateObject", __makeTemplateObject);
      exporter("__importStar", __importStar);
      exporter("__importDefault", __importDefault);
      exporter("__classPrivateFieldGet", __classPrivateFieldGet);
      exporter("__classPrivateFieldSet", __classPrivateFieldSet);
      exporter("__classPrivateFieldIn", __classPrivateFieldIn);
      exporter("__addDisposableResource", __addDisposableResource);
      exporter("__disposeResources", __disposeResources);
      exporter("__rewriteRelativeImportExtension", __rewriteRelativeImportExtension);
    });
  }
});

// node_modules/.pnpm/@supabase+functions-js@2.86.2/node_modules/@supabase/functions-js/dist/main/helper.js
var require_helper = __commonJS({
  "node_modules/.pnpm/@supabase+functions-js@2.86.2/node_modules/@supabase/functions-js/dist/main/helper.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveFetch = void 0;
    var resolveFetch = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
    exports.resolveFetch = resolveFetch;
  }
});

// node_modules/.pnpm/@supabase+functions-js@2.86.2/node_modules/@supabase/functions-js/dist/main/types.js
var require_types = __commonJS({
  "node_modules/.pnpm/@supabase+functions-js@2.86.2/node_modules/@supabase/functions-js/dist/main/types.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FunctionRegion = exports.FunctionsHttpError = exports.FunctionsRelayError = exports.FunctionsFetchError = exports.FunctionsError = void 0;
    var FunctionsError2 = class extends Error {
      constructor(message, name = "FunctionsError", context) {
        super(message);
        this.name = name;
        this.context = context;
      }
    };
    __name(FunctionsError2, "FunctionsError");
    exports.FunctionsError = FunctionsError2;
    var FunctionsFetchError2 = class extends FunctionsError2 {
      constructor(context) {
        super("Failed to send a request to the Edge Function", "FunctionsFetchError", context);
      }
    };
    __name(FunctionsFetchError2, "FunctionsFetchError");
    exports.FunctionsFetchError = FunctionsFetchError2;
    var FunctionsRelayError2 = class extends FunctionsError2 {
      constructor(context) {
        super("Relay Error invoking the Edge Function", "FunctionsRelayError", context);
      }
    };
    __name(FunctionsRelayError2, "FunctionsRelayError");
    exports.FunctionsRelayError = FunctionsRelayError2;
    var FunctionsHttpError2 = class extends FunctionsError2 {
      constructor(context) {
        super("Edge Function returned a non-2xx status code", "FunctionsHttpError", context);
      }
    };
    __name(FunctionsHttpError2, "FunctionsHttpError");
    exports.FunctionsHttpError = FunctionsHttpError2;
    var FunctionRegion2;
    (function(FunctionRegion3) {
      FunctionRegion3["Any"] = "any";
      FunctionRegion3["ApNortheast1"] = "ap-northeast-1";
      FunctionRegion3["ApNortheast2"] = "ap-northeast-2";
      FunctionRegion3["ApSouth1"] = "ap-south-1";
      FunctionRegion3["ApSoutheast1"] = "ap-southeast-1";
      FunctionRegion3["ApSoutheast2"] = "ap-southeast-2";
      FunctionRegion3["CaCentral1"] = "ca-central-1";
      FunctionRegion3["EuCentral1"] = "eu-central-1";
      FunctionRegion3["EuWest1"] = "eu-west-1";
      FunctionRegion3["EuWest2"] = "eu-west-2";
      FunctionRegion3["EuWest3"] = "eu-west-3";
      FunctionRegion3["SaEast1"] = "sa-east-1";
      FunctionRegion3["UsEast1"] = "us-east-1";
      FunctionRegion3["UsWest1"] = "us-west-1";
      FunctionRegion3["UsWest2"] = "us-west-2";
    })(FunctionRegion2 || (exports.FunctionRegion = FunctionRegion2 = {}));
  }
});

// node_modules/.pnpm/@supabase+functions-js@2.86.2/node_modules/@supabase/functions-js/dist/main/FunctionsClient.js
var require_FunctionsClient = __commonJS({
  "node_modules/.pnpm/@supabase+functions-js@2.86.2/node_modules/@supabase/functions-js/dist/main/FunctionsClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FunctionsClient = void 0;
    var tslib_1 = require_tslib();
    var helper_1 = require_helper();
    var types_1 = require_types();
    var FunctionsClient = class {
      /**
       * Creates a new Functions client bound to an Edge Functions URL.
       *
       * @example
       * ```ts
       * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
       *
       * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
       *   headers: { apikey: 'public-anon-key' },
       *   region: FunctionRegion.UsEast1,
       * })
       * ```
       */
      constructor(url, { headers = {}, customFetch, region = types_1.FunctionRegion.Any } = {}) {
        this.url = url;
        this.headers = headers;
        this.region = region;
        this.fetch = (0, helper_1.resolveFetch)(customFetch);
      }
      /**
       * Updates the authorization header
       * @param token - the new jwt token sent in the authorisation header
       * @example
       * ```ts
       * functions.setAuth(session.access_token)
       * ```
       */
      setAuth(token) {
        this.headers.Authorization = `Bearer ${token}`;
      }
      /**
       * Invokes a function
       * @param functionName - The name of the Function to invoke.
       * @param options - Options for invoking the Function.
       * @example
       * ```ts
       * const { data, error } = await functions.invoke('hello-world', {
       *   body: { name: 'Ada' },
       * })
       * ```
       */
      invoke(functionName_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (functionName, options = {}) {
          var _a;
          let timeoutId;
          let timeoutController;
          try {
            const { headers, method, body: functionArgs, signal, timeout } = options;
            let _headers = {};
            let { region } = options;
            if (!region) {
              region = this.region;
            }
            const url = new URL(`${this.url}/${functionName}`);
            if (region && region !== "any") {
              _headers["x-region"] = region;
              url.searchParams.set("forceFunctionRegion", region);
            }
            let body;
            if (functionArgs && (headers && !Object.prototype.hasOwnProperty.call(headers, "Content-Type") || !headers)) {
              if (typeof Blob !== "undefined" && functionArgs instanceof Blob || functionArgs instanceof ArrayBuffer) {
                _headers["Content-Type"] = "application/octet-stream";
                body = functionArgs;
              } else if (typeof functionArgs === "string") {
                _headers["Content-Type"] = "text/plain";
                body = functionArgs;
              } else if (typeof FormData !== "undefined" && functionArgs instanceof FormData) {
                body = functionArgs;
              } else {
                _headers["Content-Type"] = "application/json";
                body = JSON.stringify(functionArgs);
              }
            } else {
              body = functionArgs;
            }
            let effectiveSignal = signal;
            if (timeout) {
              timeoutController = new AbortController();
              timeoutId = setTimeout(() => timeoutController.abort(), timeout);
              if (signal) {
                effectiveSignal = timeoutController.signal;
                signal.addEventListener("abort", () => timeoutController.abort());
              } else {
                effectiveSignal = timeoutController.signal;
              }
            }
            const response = yield this.fetch(url.toString(), {
              method: method || "POST",
              // headers priority is (high to low):
              // 1. invoke-level headers
              // 2. client-level headers
              // 3. default Content-Type header
              headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
              body,
              signal: effectiveSignal
            }).catch((fetchError) => {
              throw new types_1.FunctionsFetchError(fetchError);
            });
            const isRelayError = response.headers.get("x-relay-error");
            if (isRelayError && isRelayError === "true") {
              throw new types_1.FunctionsRelayError(response);
            }
            if (!response.ok) {
              throw new types_1.FunctionsHttpError(response);
            }
            let responseType = ((_a = response.headers.get("Content-Type")) !== null && _a !== void 0 ? _a : "text/plain").split(";")[0].trim();
            let data;
            if (responseType === "application/json") {
              data = yield response.json();
            } else if (responseType === "application/octet-stream" || responseType === "application/pdf") {
              data = yield response.blob();
            } else if (responseType === "text/event-stream") {
              data = response;
            } else if (responseType === "multipart/form-data") {
              data = yield response.formData();
            } else {
              data = yield response.text();
            }
            return { data, error: null, response };
          } catch (error) {
            return {
              data: null,
              error,
              response: error instanceof types_1.FunctionsHttpError || error instanceof types_1.FunctionsRelayError ? error.context : void 0
            };
          } finally {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          }
        });
      }
    };
    __name(FunctionsClient, "FunctionsClient");
    exports.FunctionsClient = FunctionsClient;
  }
});

// node_modules/.pnpm/@supabase+functions-js@2.86.2/node_modules/@supabase/functions-js/dist/main/index.js
var require_main = __commonJS({
  "node_modules/.pnpm/@supabase+functions-js@2.86.2/node_modules/@supabase/functions-js/dist/main/index.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FunctionRegion = exports.FunctionsRelayError = exports.FunctionsHttpError = exports.FunctionsFetchError = exports.FunctionsError = exports.FunctionsClient = void 0;
    var FunctionsClient_1 = require_FunctionsClient();
    Object.defineProperty(exports, "FunctionsClient", { enumerable: true, get: function() {
      return FunctionsClient_1.FunctionsClient;
    } });
    var types_1 = require_types();
    Object.defineProperty(exports, "FunctionsError", { enumerable: true, get: function() {
      return types_1.FunctionsError;
    } });
    Object.defineProperty(exports, "FunctionsFetchError", { enumerable: true, get: function() {
      return types_1.FunctionsFetchError;
    } });
    Object.defineProperty(exports, "FunctionsHttpError", { enumerable: true, get: function() {
      return types_1.FunctionsHttpError;
    } });
    Object.defineProperty(exports, "FunctionsRelayError", { enumerable: true, get: function() {
      return types_1.FunctionsRelayError;
    } });
    Object.defineProperty(exports, "FunctionRegion", { enumerable: true, get: function() {
      return types_1.FunctionRegion;
    } });
  }
});

// node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestError.js
var require_PostgrestError = __commonJS({
  "node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestError.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var PostgrestError2 = class extends Error {
      /**
       * @example
       * ```ts
       * import PostgrestError from '@supabase/postgrest-js'
       *
       * throw new PostgrestError({
       *   message: 'Row level security prevented the request',
       *   details: 'RLS denied the insert',
       *   hint: 'Check your policies',
       *   code: 'PGRST301',
       * })
       * ```
       */
      constructor(context) {
        super(context.message);
        this.name = "PostgrestError";
        this.details = context.details;
        this.hint = context.hint;
        this.code = context.code;
      }
    };
    __name(PostgrestError2, "PostgrestError");
    exports.default = PostgrestError2;
  }
});

// node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestBuilder.js
var require_PostgrestBuilder = __commonJS({
  "node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestBuilder.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestError_1 = tslib_1.__importDefault(require_PostgrestError());
    var PostgrestBuilder = class {
      /**
       * Creates a builder configured for a specific PostgREST request.
       *
       * @example
       * ```ts
       * import PostgrestQueryBuilder from '@supabase/postgrest-js'
       *
       * const builder = new PostgrestQueryBuilder(
       *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
       *   { headers: new Headers({ apikey: 'public-anon-key' }) }
       * )
       * ```
       */
      constructor(builder) {
        var _a, _b;
        this.shouldThrowOnError = false;
        this.method = builder.method;
        this.url = builder.url;
        this.headers = new Headers(builder.headers);
        this.schema = builder.schema;
        this.body = builder.body;
        this.shouldThrowOnError = (_a = builder.shouldThrowOnError) !== null && _a !== void 0 ? _a : false;
        this.signal = builder.signal;
        this.isMaybeSingle = (_b = builder.isMaybeSingle) !== null && _b !== void 0 ? _b : false;
        if (builder.fetch) {
          this.fetch = builder.fetch;
        } else {
          this.fetch = fetch;
        }
      }
      /**
       * If there's an error with the query, throwOnError will reject the promise by
       * throwing the error instead of returning it as part of a successful response.
       *
       * {@link https://github.com/supabase/supabase-js/issues/92}
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       * Set an HTTP header for the request.
       */
      setHeader(name, value) {
        this.headers = new Headers(this.headers);
        this.headers.set(name, value);
        return this;
      }
      then(onfulfilled, onrejected) {
        if (this.schema === void 0) {
        } else if (["GET", "HEAD"].includes(this.method)) {
          this.headers.set("Accept-Profile", this.schema);
        } else {
          this.headers.set("Content-Profile", this.schema);
        }
        if (this.method !== "GET" && this.method !== "HEAD") {
          this.headers.set("Content-Type", "application/json");
        }
        const _fetch = this.fetch;
        let res = _fetch(this.url.toString(), {
          method: this.method,
          headers: this.headers,
          body: JSON.stringify(this.body),
          signal: this.signal
        }).then(async (res2) => {
          var _a, _b, _c, _d;
          let error = null;
          let data = null;
          let count = null;
          let status = res2.status;
          let statusText = res2.statusText;
          if (res2.ok) {
            if (this.method !== "HEAD") {
              const body = await res2.text();
              if (body === "") {
              } else if (this.headers.get("Accept") === "text/csv") {
                data = body;
              } else if (this.headers.get("Accept") && ((_a = this.headers.get("Accept")) === null || _a === void 0 ? void 0 : _a.includes("application/vnd.pgrst.plan+text"))) {
                data = body;
              } else {
                data = JSON.parse(body);
              }
            }
            const countHeader = (_b = this.headers.get("Prefer")) === null || _b === void 0 ? void 0 : _b.match(/count=(exact|planned|estimated)/);
            const contentRange = (_c = res2.headers.get("content-range")) === null || _c === void 0 ? void 0 : _c.split("/");
            if (countHeader && contentRange && contentRange.length > 1) {
              count = parseInt(contentRange[1]);
            }
            if (this.isMaybeSingle && this.method === "GET" && Array.isArray(data)) {
              if (data.length > 1) {
                error = {
                  // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
                  code: "PGRST116",
                  details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                  hint: null,
                  message: "JSON object requested, multiple (or no) rows returned"
                };
                data = null;
                count = null;
                status = 406;
                statusText = "Not Acceptable";
              } else if (data.length === 1) {
                data = data[0];
              } else {
                data = null;
              }
            }
          } else {
            const body = await res2.text();
            try {
              error = JSON.parse(body);
              if (Array.isArray(error) && res2.status === 404) {
                data = [];
                error = null;
                status = 200;
                statusText = "OK";
              }
            } catch (_e) {
              if (res2.status === 404 && body === "") {
                status = 204;
                statusText = "No Content";
              } else {
                error = {
                  message: body
                };
              }
            }
            if (error && this.isMaybeSingle && ((_d = error === null || error === void 0 ? void 0 : error.details) === null || _d === void 0 ? void 0 : _d.includes("0 rows"))) {
              error = null;
              status = 200;
              statusText = "OK";
            }
            if (error && this.shouldThrowOnError) {
              throw new PostgrestError_1.default(error);
            }
          }
          const postgrestResponse = {
            error,
            data,
            count,
            status,
            statusText
          };
          return postgrestResponse;
        });
        if (!this.shouldThrowOnError) {
          res = res.catch((fetchError) => {
            var _a, _b, _c, _d, _e, _f;
            let errorDetails = "";
            const cause = fetchError === null || fetchError === void 0 ? void 0 : fetchError.cause;
            if (cause) {
              const causeMessage = (_a = cause === null || cause === void 0 ? void 0 : cause.message) !== null && _a !== void 0 ? _a : "";
              const causeCode = (_b = cause === null || cause === void 0 ? void 0 : cause.code) !== null && _b !== void 0 ? _b : "";
              errorDetails = `${(_c = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _c !== void 0 ? _c : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`;
              errorDetails += `

Caused by: ${(_d = cause === null || cause === void 0 ? void 0 : cause.name) !== null && _d !== void 0 ? _d : "Error"}: ${causeMessage}`;
              if (causeCode) {
                errorDetails += ` (${causeCode})`;
              }
              if (cause === null || cause === void 0 ? void 0 : cause.stack) {
                errorDetails += `
${cause.stack}`;
              }
            } else {
              errorDetails = (_e = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _e !== void 0 ? _e : "";
            }
            return {
              error: {
                message: `${(_f = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _f !== void 0 ? _f : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
                details: errorDetails,
                hint: "",
                code: ""
              },
              data: null,
              count: null,
              status: 0,
              statusText: ""
            };
          });
        }
        return res.then(onfulfilled, onrejected);
      }
      /**
       * Override the type of the returned `data`.
       *
       * @typeParam NewResult - The new result type to override with
       * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
       */
      returns() {
        return this;
      }
      /**
       * Override the type of the returned `data` field in the response.
       *
       * @typeParam NewResult - The new type to cast the response data to
       * @typeParam Options - Optional type configuration (defaults to { merge: true })
       * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
       * @example
       * ```typescript
       * // Merge with existing types (default behavior)
       * const query = supabase
       *   .from('users')
       *   .select()
       *   .overrideTypes<{ custom_field: string }>()
       *
       * // Replace existing types completely
       * const replaceQuery = supabase
       *   .from('users')
       *   .select()
       *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
       * ```
       * @returns A PostgrestBuilder instance with the new type
       */
      overrideTypes() {
        return this;
      }
    };
    __name(PostgrestBuilder, "PostgrestBuilder");
    exports.default = PostgrestBuilder;
  }
});

// node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestTransformBuilder.js
var require_PostgrestTransformBuilder = __commonJS({
  "node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestTransformBuilder.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestBuilder_1 = tslib_1.__importDefault(require_PostgrestBuilder());
    var PostgrestTransformBuilder = class extends PostgrestBuilder_1.default {
      /**
       * Perform a SELECT on the query result.
       *
       * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
       * return modified rows. By calling this method, modified rows are returned in
       * `data`.
       *
       * @param columns - The columns to retrieve, separated by commas
       */
      select(columns) {
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
          if (/\s/.test(c) && !quoted) {
            return "";
          }
          if (c === '"') {
            quoted = !quoted;
          }
          return c;
        }).join("");
        this.url.searchParams.set("select", cleanedColumns);
        this.headers.append("Prefer", "return=representation");
        return this;
      }
      /**
       * Order the query result by `column`.
       *
       * You can call this method multiple times to order by multiple columns.
       *
       * You can order referenced tables, but it only affects the ordering of the
       * parent table if you use `!inner` in the query.
       *
       * @param column - The column to order by
       * @param options - Named parameters
       * @param options.ascending - If `true`, the result will be in ascending order
       * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
       * `null`s appear last.
       * @param options.referencedTable - Set this to order a referenced table by
       * its columns
       * @param options.foreignTable - Deprecated, use `options.referencedTable`
       * instead
       */
      order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable } = {}) {
        const key = referencedTable ? `${referencedTable}.order` : "order";
        const existingOrder = this.url.searchParams.get(key);
        this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
        return this;
      }
      /**
       * Limit the query result by `count`.
       *
       * @param count - The maximum number of rows to return
       * @param options - Named parameters
       * @param options.referencedTable - Set this to limit rows of referenced
       * tables instead of the parent table
       * @param options.foreignTable - Deprecated, use `options.referencedTable`
       * instead
       */
      limit(count, { foreignTable, referencedTable = foreignTable } = {}) {
        const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
        this.url.searchParams.set(key, `${count}`);
        return this;
      }
      /**
       * Limit the query result by starting at an offset `from` and ending at the offset `to`.
       * Only records within this range are returned.
       * This respects the query order and if there is no order clause the range could behave unexpectedly.
       * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
       * and fourth rows of the query.
       *
       * @param from - The starting index from which to limit the result
       * @param to - The last index to which to limit the result
       * @param options - Named parameters
       * @param options.referencedTable - Set this to limit rows of referenced
       * tables instead of the parent table
       * @param options.foreignTable - Deprecated, use `options.referencedTable`
       * instead
       */
      range(from, to, { foreignTable, referencedTable = foreignTable } = {}) {
        const keyOffset = typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`;
        const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
        this.url.searchParams.set(keyOffset, `${from}`);
        this.url.searchParams.set(keyLimit, `${to - from + 1}`);
        return this;
      }
      /**
       * Set the AbortSignal for the fetch request.
       *
       * @param signal - The AbortSignal to use for the fetch request
       */
      abortSignal(signal) {
        this.signal = signal;
        return this;
      }
      /**
       * Return `data` as a single object instead of an array of objects.
       *
       * Query result must be one row (e.g. using `.limit(1)`), otherwise this
       * returns an error.
       */
      single() {
        this.headers.set("Accept", "application/vnd.pgrst.object+json");
        return this;
      }
      /**
       * Return `data` as a single object instead of an array of objects.
       *
       * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
       * this returns an error.
       */
      maybeSingle() {
        if (this.method === "GET") {
          this.headers.set("Accept", "application/json");
        } else {
          this.headers.set("Accept", "application/vnd.pgrst.object+json");
        }
        this.isMaybeSingle = true;
        return this;
      }
      /**
       * Return `data` as a string in CSV format.
       */
      csv() {
        this.headers.set("Accept", "text/csv");
        return this;
      }
      /**
       * Return `data` as an object in [GeoJSON](https://geojson.org) format.
       */
      geojson() {
        this.headers.set("Accept", "application/geo+json");
        return this;
      }
      /**
       * Return `data` as the EXPLAIN plan for the query.
       *
       * You need to enable the
       * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
       * setting before using this method.
       *
       * @param options - Named parameters
       *
       * @param options.analyze - If `true`, the query will be executed and the
       * actual run time will be returned
       *
       * @param options.verbose - If `true`, the query identifier will be returned
       * and `data` will include the output columns of the query
       *
       * @param options.settings - If `true`, include information on configuration
       * parameters that affect query planning
       *
       * @param options.buffers - If `true`, include information on buffer usage
       *
       * @param options.wal - If `true`, include information on WAL record generation
       *
       * @param options.format - The format of the output, can be `"text"` (default)
       * or `"json"`
       */
      explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = "text" } = {}) {
        var _a;
        const options = [
          analyze ? "analyze" : null,
          verbose ? "verbose" : null,
          settings ? "settings" : null,
          buffers ? "buffers" : null,
          wal ? "wal" : null
        ].filter(Boolean).join("|");
        const forMediatype = (_a = this.headers.get("Accept")) !== null && _a !== void 0 ? _a : "application/json";
        this.headers.set("Accept", `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`);
        if (format === "json") {
          return this;
        } else {
          return this;
        }
      }
      /**
       * Rollback the query.
       *
       * `data` will still be returned, but the query is not committed.
       */
      rollback() {
        this.headers.append("Prefer", "tx=rollback");
        return this;
      }
      /**
       * Override the type of the returned `data`.
       *
       * @typeParam NewResult - The new result type to override with
       * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
       */
      returns() {
        return this;
      }
      /**
       * Set the maximum number of rows that can be affected by the query.
       * Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
       *
       * @param value - The maximum number of rows that can be affected
       */
      maxAffected(value) {
        this.headers.append("Prefer", "handling=strict");
        this.headers.append("Prefer", `max-affected=${value}`);
        return this;
      }
    };
    __name(PostgrestTransformBuilder, "PostgrestTransformBuilder");
    exports.default = PostgrestTransformBuilder;
  }
});

// node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestFilterBuilder.js
var require_PostgrestFilterBuilder = __commonJS({
  "node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestFilterBuilder.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestTransformBuilder_1 = tslib_1.__importDefault(require_PostgrestTransformBuilder());
    var PostgrestReservedCharsRegexp = new RegExp("[,()]");
    var PostgrestFilterBuilder = class extends PostgrestTransformBuilder_1.default {
      /**
       * Match only rows where `column` is equal to `value`.
       *
       * To check if the value of `column` is NULL, you should use `.is()` instead.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      eq(column, value) {
        this.url.searchParams.append(column, `eq.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is not equal to `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      neq(column, value) {
        this.url.searchParams.append(column, `neq.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is greater than `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      gt(column, value) {
        this.url.searchParams.append(column, `gt.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is greater than or equal to `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      gte(column, value) {
        this.url.searchParams.append(column, `gte.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is less than `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      lt(column, value) {
        this.url.searchParams.append(column, `lt.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is less than or equal to `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      lte(column, value) {
        this.url.searchParams.append(column, `lte.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` matches `pattern` case-sensitively.
       *
       * @param column - The column to filter on
       * @param pattern - The pattern to match with
       */
      like(column, pattern) {
        this.url.searchParams.append(column, `like.${pattern}`);
        return this;
      }
      /**
       * Match only rows where `column` matches all of `patterns` case-sensitively.
       *
       * @param column - The column to filter on
       * @param patterns - The patterns to match with
       */
      likeAllOf(column, patterns) {
        this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`);
        return this;
      }
      /**
       * Match only rows where `column` matches any of `patterns` case-sensitively.
       *
       * @param column - The column to filter on
       * @param patterns - The patterns to match with
       */
      likeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`);
        return this;
      }
      /**
       * Match only rows where `column` matches `pattern` case-insensitively.
       *
       * @param column - The column to filter on
       * @param pattern - The pattern to match with
       */
      ilike(column, pattern) {
        this.url.searchParams.append(column, `ilike.${pattern}`);
        return this;
      }
      /**
       * Match only rows where `column` matches all of `patterns` case-insensitively.
       *
       * @param column - The column to filter on
       * @param patterns - The patterns to match with
       */
      ilikeAllOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`);
        return this;
      }
      /**
       * Match only rows where `column` matches any of `patterns` case-insensitively.
       *
       * @param column - The column to filter on
       * @param patterns - The patterns to match with
       */
      ilikeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`);
        return this;
      }
      /**
       * Match only rows where `column` matches the PostgreSQL regex `pattern`
       * case-sensitively (using the `~` operator).
       *
       * @param column - The column to filter on
       * @param pattern - The PostgreSQL regular expression pattern to match with
       */
      regexMatch(column, pattern) {
        this.url.searchParams.append(column, `match.${pattern}`);
        return this;
      }
      /**
       * Match only rows where `column` matches the PostgreSQL regex `pattern`
       * case-insensitively (using the `~*` operator).
       *
       * @param column - The column to filter on
       * @param pattern - The PostgreSQL regular expression pattern to match with
       */
      regexIMatch(column, pattern) {
        this.url.searchParams.append(column, `imatch.${pattern}`);
        return this;
      }
      /**
       * Match only rows where `column` IS `value`.
       *
       * For non-boolean columns, this is only relevant for checking if the value of
       * `column` is NULL by setting `value` to `null`.
       *
       * For boolean columns, you can also set `value` to `true` or `false` and it
       * will behave the same way as `.eq()`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      is(column, value) {
        this.url.searchParams.append(column, `is.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` IS DISTINCT FROM `value`.
       *
       * Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
       * are considered equal (not distinct), and comparing `NULL` with any non-NULL
       * value returns true (distinct).
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      isDistinct(column, value) {
        this.url.searchParams.append(column, `isdistinct.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is included in the `values` array.
       *
       * @param column - The column to filter on
       * @param values - The values array to filter with
       */
      in(column, values) {
        const cleanedValues = Array.from(new Set(values)).map((s) => {
          if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s))
            return `"${s}"`;
          else
            return `${s}`;
        }).join(",");
        this.url.searchParams.append(column, `in.(${cleanedValues})`);
        return this;
      }
      /**
       * Only relevant for jsonb, array, and range columns. Match only rows where
       * `column` contains every element appearing in `value`.
       *
       * @param column - The jsonb, array, or range column to filter on
       * @param value - The jsonb, array, or range value to filter with
       */
      contains(column, value) {
        if (typeof value === "string") {
          this.url.searchParams.append(column, `cs.${value}`);
        } else if (Array.isArray(value)) {
          this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
        } else {
          this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
        }
        return this;
      }
      /**
       * Only relevant for jsonb, array, and range columns. Match only rows where
       * every element appearing in `column` is contained by `value`.
       *
       * @param column - The jsonb, array, or range column to filter on
       * @param value - The jsonb, array, or range value to filter with
       */
      containedBy(column, value) {
        if (typeof value === "string") {
          this.url.searchParams.append(column, `cd.${value}`);
        } else if (Array.isArray(value)) {
          this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
        } else {
          this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
        }
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where every element in
       * `column` is greater than any element in `range`.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeGt(column, range) {
        this.url.searchParams.append(column, `sr.${range}`);
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where every element in
       * `column` is either contained in `range` or greater than any element in
       * `range`.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeGte(column, range) {
        this.url.searchParams.append(column, `nxl.${range}`);
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where every element in
       * `column` is less than any element in `range`.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeLt(column, range) {
        this.url.searchParams.append(column, `sl.${range}`);
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where every element in
       * `column` is either contained in `range` or less than any element in
       * `range`.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeLte(column, range) {
        this.url.searchParams.append(column, `nxr.${range}`);
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where `column` is
       * mutually exclusive to `range` and there can be no element between the two
       * ranges.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeAdjacent(column, range) {
        this.url.searchParams.append(column, `adj.${range}`);
        return this;
      }
      /**
       * Only relevant for array and range columns. Match only rows where
       * `column` and `value` have an element in common.
       *
       * @param column - The array or range column to filter on
       * @param value - The array or range value to filter with
       */
      overlaps(column, value) {
        if (typeof value === "string") {
          this.url.searchParams.append(column, `ov.${value}`);
        } else {
          this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
        }
        return this;
      }
      /**
       * Only relevant for text and tsvector columns. Match only rows where
       * `column` matches the query string in `query`.
       *
       * @param column - The text or tsvector column to filter on
       * @param query - The query text to match with
       * @param options - Named parameters
       * @param options.config - The text search configuration to use
       * @param options.type - Change how the `query` text is interpreted
       */
      textSearch(column, query, { config, type } = {}) {
        let typePart = "";
        if (type === "plain") {
          typePart = "pl";
        } else if (type === "phrase") {
          typePart = "ph";
        } else if (type === "websearch") {
          typePart = "w";
        }
        const configPart = config === void 0 ? "" : `(${config})`;
        this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
        return this;
      }
      /**
       * Match only rows where each column in `query` keys is equal to its
       * associated value. Shorthand for multiple `.eq()`s.
       *
       * @param query - The object to filter with, with column names as keys mapped
       * to their filter values
       */
      match(query) {
        Object.entries(query).forEach(([column, value]) => {
          this.url.searchParams.append(column, `eq.${value}`);
        });
        return this;
      }
      /**
       * Match only rows which doesn't satisfy the filter.
       *
       * Unlike most filters, `opearator` and `value` are used as-is and need to
       * follow [PostgREST
       * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
       * to make sure they are properly sanitized.
       *
       * @param column - The column to filter on
       * @param operator - The operator to be negated to filter with, following
       * PostgREST syntax
       * @param value - The value to filter with, following PostgREST syntax
       */
      not(column, operator, value) {
        this.url.searchParams.append(column, `not.${operator}.${value}`);
        return this;
      }
      /**
       * Match only rows which satisfy at least one of the filters.
       *
       * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
       * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
       * to make sure it's properly sanitized.
       *
       * It's currently not possible to do an `.or()` filter across multiple tables.
       *
       * @param filters - The filters to use, following PostgREST syntax
       * @param options - Named parameters
       * @param options.referencedTable - Set this to filter on referenced tables
       * instead of the parent table
       * @param options.foreignTable - Deprecated, use `referencedTable` instead
       */
      or(filters, { foreignTable, referencedTable = foreignTable } = {}) {
        const key = referencedTable ? `${referencedTable}.or` : "or";
        this.url.searchParams.append(key, `(${filters})`);
        return this;
      }
      /**
       * Match only rows which satisfy the filter. This is an escape hatch - you
       * should use the specific filter methods wherever possible.
       *
       * Unlike most filters, `opearator` and `value` are used as-is and need to
       * follow [PostgREST
       * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
       * to make sure they are properly sanitized.
       *
       * @param column - The column to filter on
       * @param operator - The operator to filter with, following PostgREST syntax
       * @param value - The value to filter with, following PostgREST syntax
       */
      filter(column, operator, value) {
        this.url.searchParams.append(column, `${operator}.${value}`);
        return this;
      }
    };
    __name(PostgrestFilterBuilder, "PostgrestFilterBuilder");
    exports.default = PostgrestFilterBuilder;
  }
});

// node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestQueryBuilder.js
var require_PostgrestQueryBuilder = __commonJS({
  "node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestQueryBuilder.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestFilterBuilder_1 = tslib_1.__importDefault(require_PostgrestFilterBuilder());
    var PostgrestQueryBuilder = class {
      /**
       * Creates a query builder scoped to a Postgres table or view.
       *
       * @example
       * ```ts
       * import PostgrestQueryBuilder from '@supabase/postgrest-js'
       *
       * const query = new PostgrestQueryBuilder(
       *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
       *   { headers: { apikey: 'public-anon-key' } }
       * )
       * ```
       */
      constructor(url, { headers = {}, schema, fetch: fetch2 }) {
        this.url = url;
        this.headers = new Headers(headers);
        this.schema = schema;
        this.fetch = fetch2;
      }
      /**
       * Perform a SELECT query on the table or view.
       *
       * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
       *
       * @param options - Named parameters
       *
       * @param options.head - When set to `true`, `data` will not be returned.
       * Useful if you only need the count.
       *
       * @param options.count - Count algorithm to use to count rows in the table or view.
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      select(columns, options) {
        const { head = false, count } = options !== null && options !== void 0 ? options : {};
        const method = head ? "HEAD" : "GET";
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
          if (/\s/.test(c) && !quoted) {
            return "";
          }
          if (c === '"') {
            quoted = !quoted;
          }
          return c;
        }).join("");
        this.url.searchParams.set("select", cleanedColumns);
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          fetch: this.fetch
        });
      }
      /**
       * Perform an INSERT into the table or view.
       *
       * By default, inserted rows are not returned. To return it, chain the call
       * with `.select()`.
       *
       * @param values - The values to insert. Pass an object to insert a single row
       * or an array to insert multiple rows.
       *
       * @param options - Named parameters
       *
       * @param options.count - Count algorithm to use to count inserted rows.
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       *
       * @param options.defaultToNull - Make missing fields default to `null`.
       * Otherwise, use the default value for the column. Only applies for bulk
       * inserts.
       */
      insert(values, { count, defaultToNull = true } = {}) {
        var _a;
        const method = "POST";
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        if (!defaultToNull) {
          this.headers.append("Prefer", `missing=default`);
        }
        if (Array.isArray(values)) {
          const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
          if (columns.length > 0) {
            const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
            this.url.searchParams.set("columns", uniqueColumns.join(","));
          }
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          body: values,
          fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch
        });
      }
      /**
      * Perform an UPSERT on the table or view. Depending on the column(s) passed
      * to `onConflict`, `.upsert()` allows you to perform the equivalent of
      * `.insert()` if a row with the corresponding `onConflict` columns doesn't
      * exist, or if it does exist, perform an alternative action depending on
      * `ignoreDuplicates`.
      *
      * By default, upserted rows are not returned. To return it, chain the call
      * with `.select()`.
      *
      * @param values - The values to upsert with. Pass an object to upsert a
      * single row or an array to upsert multiple rows.
      *
      * @param options - Named parameters
      *
      * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
      * duplicate rows are determined. Two rows are duplicates if all the
      * `onConflict` columns are equal.
      *
      * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
      * `false`, duplicate rows are merged with existing rows.
      *
      * @param options.count - Count algorithm to use to count upserted rows.
      *
      * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
      * hood.
      *
      * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
      * statistics under the hood.
      *
      * `"estimated"`: Uses exact count for low numbers and planned count for high
      * numbers.
      *
      * @param options.defaultToNull - Make missing fields default to `null`.
      * Otherwise, use the default value for the column. This only applies when
      * inserting new rows, not when merging with existing rows under
      * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
      *
      * @example Upsert a single row using a unique key
      * ```ts
      * // Upserting a single row, overwriting based on the 'username' unique column
      * const { data, error } = await supabase
      *   .from('users')
      *   .upsert({ username: 'supabot' }, { onConflict: 'username' })
      *
      * // Example response:
      * // {
      * //   data: [
      * //     { id: 4, message: 'bar', username: 'supabot' }
      * //   ],
      * //   error: null
      * // }
      * ```
      *
      * @example Upsert with conflict resolution and exact row counting
      * ```ts
      * // Upserting and returning exact count
      * const { data, error, count } = await supabase
      *   .from('users')
      *   .upsert(
      *     {
      *       id: 3,
      *       message: 'foo',
      *       username: 'supabot'
      *     },
      *     {
      *       onConflict: 'username',
      *       count: 'exact'
      *     }
      *   )
      *
      * // Example response:
      * // {
      * //   data: [
      * //     {
      * //       id: 42,
      * //       handle: "saoirse",
      * //       display_name: "Saoirse"
      * //     }
      * //   ],
      * //   count: 1,
      * //   error: null
      * // }
      * ```
      */
      upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true } = {}) {
        var _a;
        const method = "POST";
        this.headers.append("Prefer", `resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`);
        if (onConflict !== void 0)
          this.url.searchParams.set("on_conflict", onConflict);
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        if (!defaultToNull) {
          this.headers.append("Prefer", "missing=default");
        }
        if (Array.isArray(values)) {
          const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
          if (columns.length > 0) {
            const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
            this.url.searchParams.set("columns", uniqueColumns.join(","));
          }
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          body: values,
          fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch
        });
      }
      /**
       * Perform an UPDATE on the table or view.
       *
       * By default, updated rows are not returned. To return it, chain the call
       * with `.select()` after filters.
       *
       * @param values - The values to update with
       *
       * @param options - Named parameters
       *
       * @param options.count - Count algorithm to use to count updated rows.
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      update(values, { count } = {}) {
        var _a;
        const method = "PATCH";
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          body: values,
          fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch
        });
      }
      /**
       * Perform a DELETE on the table or view.
       *
       * By default, deleted rows are not returned. To return it, chain the call
       * with `.select()` after filters.
       *
       * @param options - Named parameters
       *
       * @param options.count - Count algorithm to use to count deleted rows.
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      delete({ count } = {}) {
        var _a;
        const method = "DELETE";
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch
        });
      }
    };
    __name(PostgrestQueryBuilder, "PostgrestQueryBuilder");
    exports.default = PostgrestQueryBuilder;
  }
});

// node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestClient.js
var require_PostgrestClient = __commonJS({
  "node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/PostgrestClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestQueryBuilder_1 = tslib_1.__importDefault(require_PostgrestQueryBuilder());
    var PostgrestFilterBuilder_1 = tslib_1.__importDefault(require_PostgrestFilterBuilder());
    var PostgrestClient = class {
      // TODO: Add back shouldThrowOnError once we figure out the typings
      /**
       * Creates a PostgREST client.
       *
       * @param url - URL of the PostgREST endpoint
       * @param options - Named parameters
       * @param options.headers - Custom headers
       * @param options.schema - Postgres schema to switch to
       * @param options.fetch - Custom fetch
       * @example
       * ```ts
       * import PostgrestClient from '@supabase/postgrest-js'
       *
       * const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
       *   headers: { apikey: 'public-anon-key' },
       *   schema: 'public',
       * })
       * ```
       */
      constructor(url, { headers = {}, schema, fetch: fetch2 } = {}) {
        this.url = url;
        this.headers = new Headers(headers);
        this.schemaName = schema;
        this.fetch = fetch2;
      }
      /**
       * Perform a query on a table or a view.
       *
       * @param relation - The table or view name to query
       */
      from(relation) {
        if (!relation || typeof relation !== "string" || relation.trim() === "") {
          throw new Error("Invalid relation name: relation must be a non-empty string.");
        }
        const url = new URL(`${this.url}/${relation}`);
        return new PostgrestQueryBuilder_1.default(url, {
          headers: new Headers(this.headers),
          schema: this.schemaName,
          fetch: this.fetch
        });
      }
      /**
       * Select a schema to query or perform an function (rpc) call.
       *
       * The schema needs to be on the list of exposed schemas inside Supabase.
       *
       * @param schema - The schema to query
       */
      schema(schema) {
        return new PostgrestClient(this.url, {
          headers: this.headers,
          schema,
          fetch: this.fetch
        });
      }
      /**
       * Perform a function call.
       *
       * @param fn - The function name to call
       * @param args - The arguments to pass to the function call
       * @param options - Named parameters
       * @param options.head - When set to `true`, `data` will not be returned.
       * Useful if you only need the count.
       * @param options.get - When set to `true`, the function will be called with
       * read-only access mode.
       * @param options.count - Count algorithm to use to count rows returned by the
       * function. Only applicable for [set-returning
       * functions](https://www.postgresql.org/docs/current/functions-srf.html).
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       *
       * @example
       * ```ts
       * // For cross-schema functions where type inference fails, use overrideTypes:
       * const { data } = await supabase
       *   .schema('schema_b')
       *   .rpc('function_a', {})
       *   .overrideTypes<{ id: string; user_id: string }[]>()
       * ```
       */
      rpc(fn, args = {}, { head = false, get = false, count } = {}) {
        var _a;
        let method;
        const url = new URL(`${this.url}/rpc/${fn}`);
        let body;
        if (head || get) {
          method = head ? "HEAD" : "GET";
          Object.entries(args).filter(([_, value]) => value !== void 0).map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(",")}}` : `${value}`]).forEach(([name, value]) => {
            url.searchParams.append(name, value);
          });
        } else {
          method = "POST";
          body = args;
        }
        const headers = new Headers(this.headers);
        if (count) {
          headers.set("Prefer", `count=${count}`);
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url,
          headers,
          schema: this.schemaName,
          body,
          fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch
        });
      }
    };
    __name(PostgrestClient, "PostgrestClient");
    exports.default = PostgrestClient;
  }
});

// node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/.pnpm/@supabase+postgrest-js@2.86.2/node_modules/@supabase/postgrest-js/dist/cjs/index.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PostgrestError = exports.PostgrestBuilder = exports.PostgrestTransformBuilder = exports.PostgrestFilterBuilder = exports.PostgrestQueryBuilder = exports.PostgrestClient = void 0;
    var tslib_1 = require_tslib();
    var PostgrestClient_1 = tslib_1.__importDefault(require_PostgrestClient());
    exports.PostgrestClient = PostgrestClient_1.default;
    var PostgrestQueryBuilder_1 = tslib_1.__importDefault(require_PostgrestQueryBuilder());
    exports.PostgrestQueryBuilder = PostgrestQueryBuilder_1.default;
    var PostgrestFilterBuilder_1 = tslib_1.__importDefault(require_PostgrestFilterBuilder());
    exports.PostgrestFilterBuilder = PostgrestFilterBuilder_1.default;
    var PostgrestTransformBuilder_1 = tslib_1.__importDefault(require_PostgrestTransformBuilder());
    exports.PostgrestTransformBuilder = PostgrestTransformBuilder_1.default;
    var PostgrestBuilder_1 = tslib_1.__importDefault(require_PostgrestBuilder());
    exports.PostgrestBuilder = PostgrestBuilder_1.default;
    var PostgrestError_1 = tslib_1.__importDefault(require_PostgrestError());
    exports.PostgrestError = PostgrestError_1.default;
    exports.default = {
      PostgrestClient: PostgrestClient_1.default,
      PostgrestQueryBuilder: PostgrestQueryBuilder_1.default,
      PostgrestFilterBuilder: PostgrestFilterBuilder_1.default,
      PostgrestTransformBuilder: PostgrestTransformBuilder_1.default,
      PostgrestBuilder: PostgrestBuilder_1.default,
      PostgrestError: PostgrestError_1.default
    };
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js
var require_websocket_factory = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebSocketFactory = void 0;
    var WebSocketFactory = class {
      /**
       * Static-only utility – prevent instantiation.
       */
      constructor() {
      }
      static detectEnvironment() {
        var _a;
        if (typeof WebSocket !== "undefined") {
          return { type: "native", constructor: WebSocket };
        }
        if (typeof globalThis !== "undefined" && typeof globalThis.WebSocket !== "undefined") {
          return { type: "native", constructor: globalThis.WebSocket };
        }
        if (typeof global !== "undefined" && typeof global.WebSocket !== "undefined") {
          return { type: "native", constructor: global.WebSocket };
        }
        if (typeof globalThis !== "undefined" && typeof globalThis.WebSocketPair !== "undefined" && typeof globalThis.WebSocket === "undefined") {
          return {
            type: "cloudflare",
            error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",
            workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."
          };
        }
        if (typeof globalThis !== "undefined" && globalThis.EdgeRuntime || typeof navigator !== "undefined" && ((_a = "Cloudflare-Workers") === null || _a === void 0 ? void 0 : _a.includes("Vercel-Edge"))) {
          return {
            type: "unsupported",
            error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",
            workaround: "Use serverless functions or a different deployment target for WebSocket functionality."
          };
        }
        if (typeof process !== "undefined") {
          const processVersions = process["versions"];
          if (processVersions && processVersions["node"]) {
            const versionString = processVersions["node"];
            const nodeVersion = parseInt(versionString.replace(/^v/, "").split(".")[0]);
            if (nodeVersion >= 22) {
              if (typeof globalThis.WebSocket !== "undefined") {
                return { type: "native", constructor: globalThis.WebSocket };
              }
              return {
                type: "unsupported",
                error: `Node.js ${nodeVersion} detected but native WebSocket not found.`,
                workaround: "Provide a WebSocket implementation via the transport option."
              };
            }
            return {
              type: "unsupported",
              error: `Node.js ${nodeVersion} detected without native WebSocket support.`,
              workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\nimport ws from "ws"\nnew RealtimeClient(url, { transport: ws })'
            };
          }
        }
        return {
          type: "unsupported",
          error: "Unknown JavaScript runtime without WebSocket support.",
          workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
        };
      }
      /**
       * Returns the best available WebSocket constructor for the current runtime.
       *
       * @example
       * ```ts
       * const WS = WebSocketFactory.getWebSocketConstructor()
       * const socket = new WS('wss://realtime.supabase.co/socket')
       * ```
       */
      static getWebSocketConstructor() {
        const env = this.detectEnvironment();
        if (env.constructor) {
          return env.constructor;
        }
        let errorMessage = env.error || "WebSocket not supported in this environment.";
        if (env.workaround) {
          errorMessage += `

Suggested solution: ${env.workaround}`;
        }
        throw new Error(errorMessage);
      }
      /**
       * Creates a WebSocket using the detected constructor.
       *
       * @example
       * ```ts
       * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
       * ```
       */
      static createWebSocket(url, protocols) {
        const WS = this.getWebSocketConstructor();
        return new WS(url, protocols);
      }
      /**
       * Detects whether the runtime can establish WebSocket connections.
       *
       * @example
       * ```ts
       * if (!WebSocketFactory.isWebSocketSupported()) {
       *   console.warn('Falling back to long polling')
       * }
       * ```
       */
      static isWebSocketSupported() {
        try {
          const env = this.detectEnvironment();
          return env.type === "native" || env.type === "ws";
        } catch (_a) {
          return false;
        }
      }
    };
    __name(WebSocketFactory, "WebSocketFactory");
    exports.WebSocketFactory = WebSocketFactory;
    exports.default = WebSocketFactory;
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/version.js
var require_version = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/version.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.version = void 0;
    exports.version = "2.86.2";
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/constants.js
var require_constants = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/constants.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CONNECTION_STATE = exports.TRANSPORTS = exports.CHANNEL_EVENTS = exports.CHANNEL_STATES = exports.SOCKET_STATES = exports.MAX_PUSH_BUFFER_SIZE = exports.WS_CLOSE_NORMAL = exports.DEFAULT_TIMEOUT = exports.VERSION = exports.DEFAULT_VSN = exports.VSN_2_0_0 = exports.VSN_1_0_0 = exports.DEFAULT_VERSION = void 0;
    var version_1 = require_version();
    exports.DEFAULT_VERSION = `realtime-js/${version_1.version}`;
    exports.VSN_1_0_0 = "1.0.0";
    exports.VSN_2_0_0 = "2.0.0";
    exports.DEFAULT_VSN = exports.VSN_1_0_0;
    exports.VERSION = version_1.version;
    exports.DEFAULT_TIMEOUT = 1e4;
    exports.WS_CLOSE_NORMAL = 1e3;
    exports.MAX_PUSH_BUFFER_SIZE = 100;
    var SOCKET_STATES;
    (function(SOCKET_STATES2) {
      SOCKET_STATES2[SOCKET_STATES2["connecting"] = 0] = "connecting";
      SOCKET_STATES2[SOCKET_STATES2["open"] = 1] = "open";
      SOCKET_STATES2[SOCKET_STATES2["closing"] = 2] = "closing";
      SOCKET_STATES2[SOCKET_STATES2["closed"] = 3] = "closed";
    })(SOCKET_STATES || (exports.SOCKET_STATES = SOCKET_STATES = {}));
    var CHANNEL_STATES;
    (function(CHANNEL_STATES2) {
      CHANNEL_STATES2["closed"] = "closed";
      CHANNEL_STATES2["errored"] = "errored";
      CHANNEL_STATES2["joined"] = "joined";
      CHANNEL_STATES2["joining"] = "joining";
      CHANNEL_STATES2["leaving"] = "leaving";
    })(CHANNEL_STATES || (exports.CHANNEL_STATES = CHANNEL_STATES = {}));
    var CHANNEL_EVENTS;
    (function(CHANNEL_EVENTS2) {
      CHANNEL_EVENTS2["close"] = "phx_close";
      CHANNEL_EVENTS2["error"] = "phx_error";
      CHANNEL_EVENTS2["join"] = "phx_join";
      CHANNEL_EVENTS2["reply"] = "phx_reply";
      CHANNEL_EVENTS2["leave"] = "phx_leave";
      CHANNEL_EVENTS2["access_token"] = "access_token";
    })(CHANNEL_EVENTS || (exports.CHANNEL_EVENTS = CHANNEL_EVENTS = {}));
    var TRANSPORTS;
    (function(TRANSPORTS2) {
      TRANSPORTS2["websocket"] = "websocket";
    })(TRANSPORTS || (exports.TRANSPORTS = TRANSPORTS = {}));
    var CONNECTION_STATE;
    (function(CONNECTION_STATE2) {
      CONNECTION_STATE2["Connecting"] = "connecting";
      CONNECTION_STATE2["Open"] = "open";
      CONNECTION_STATE2["Closing"] = "closing";
      CONNECTION_STATE2["Closed"] = "closed";
    })(CONNECTION_STATE || (exports.CONNECTION_STATE = CONNECTION_STATE = {}));
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/serializer.js
var require_serializer = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/serializer.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var Serializer = class {
      constructor(allowedMetadataKeys) {
        this.HEADER_LENGTH = 1;
        this.USER_BROADCAST_PUSH_META_LENGTH = 6;
        this.KINDS = { userBroadcastPush: 3, userBroadcast: 4 };
        this.BINARY_ENCODING = 0;
        this.JSON_ENCODING = 1;
        this.BROADCAST_EVENT = "broadcast";
        this.allowedMetadataKeys = [];
        this.allowedMetadataKeys = allowedMetadataKeys !== null && allowedMetadataKeys !== void 0 ? allowedMetadataKeys : [];
      }
      encode(msg, callback) {
        if (msg.event === this.BROADCAST_EVENT && !(msg.payload instanceof ArrayBuffer) && typeof msg.payload.event === "string") {
          return callback(this._binaryEncodeUserBroadcastPush(msg));
        }
        let payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload];
        return callback(JSON.stringify(payload));
      }
      _binaryEncodeUserBroadcastPush(message) {
        var _a;
        if (this._isArrayBuffer((_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload)) {
          return this._encodeBinaryUserBroadcastPush(message);
        } else {
          return this._encodeJsonUserBroadcastPush(message);
        }
      }
      _encodeBinaryUserBroadcastPush(message) {
        var _a, _b;
        const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : new ArrayBuffer(0);
        return this._encodeUserBroadcastPush(message, this.BINARY_ENCODING, userPayload);
      }
      _encodeJsonUserBroadcastPush(message) {
        var _a, _b;
        const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : {};
        const encoder = new TextEncoder();
        const encodedUserPayload = encoder.encode(JSON.stringify(userPayload)).buffer;
        return this._encodeUserBroadcastPush(message, this.JSON_ENCODING, encodedUserPayload);
      }
      _encodeUserBroadcastPush(message, encodingType, encodedPayload) {
        var _a, _b;
        const topic = message.topic;
        const ref = (_a = message.ref) !== null && _a !== void 0 ? _a : "";
        const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : "";
        const userEvent = message.payload.event;
        const rest = this.allowedMetadataKeys ? this._pick(message.payload, this.allowedMetadataKeys) : {};
        const metadata = Object.keys(rest).length === 0 ? "" : JSON.stringify(rest);
        if (joinRef.length > 255) {
          throw new Error(`joinRef length ${joinRef.length} exceeds maximum of 255`);
        }
        if (ref.length > 255) {
          throw new Error(`ref length ${ref.length} exceeds maximum of 255`);
        }
        if (topic.length > 255) {
          throw new Error(`topic length ${topic.length} exceeds maximum of 255`);
        }
        if (userEvent.length > 255) {
          throw new Error(`userEvent length ${userEvent.length} exceeds maximum of 255`);
        }
        if (metadata.length > 255) {
          throw new Error(`metadata length ${metadata.length} exceeds maximum of 255`);
        }
        const metaLength = this.USER_BROADCAST_PUSH_META_LENGTH + joinRef.length + ref.length + topic.length + userEvent.length + metadata.length;
        const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
        let view = new DataView(header);
        let offset = 0;
        view.setUint8(offset++, this.KINDS.userBroadcastPush);
        view.setUint8(offset++, joinRef.length);
        view.setUint8(offset++, ref.length);
        view.setUint8(offset++, topic.length);
        view.setUint8(offset++, userEvent.length);
        view.setUint8(offset++, metadata.length);
        view.setUint8(offset++, encodingType);
        Array.from(joinRef, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(ref, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(topic, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(userEvent, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(metadata, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        var combined = new Uint8Array(header.byteLength + encodedPayload.byteLength);
        combined.set(new Uint8Array(header), 0);
        combined.set(new Uint8Array(encodedPayload), header.byteLength);
        return combined.buffer;
      }
      decode(rawPayload, callback) {
        if (this._isArrayBuffer(rawPayload)) {
          let result = this._binaryDecode(rawPayload);
          return callback(result);
        }
        if (typeof rawPayload === "string") {
          const jsonPayload = JSON.parse(rawPayload);
          const [join_ref, ref, topic, event, payload] = jsonPayload;
          return callback({ join_ref, ref, topic, event, payload });
        }
        return callback({});
      }
      _binaryDecode(buffer) {
        const view = new DataView(buffer);
        const kind = view.getUint8(0);
        const decoder = new TextDecoder();
        switch (kind) {
          case this.KINDS.userBroadcast:
            return this._decodeUserBroadcast(buffer, view, decoder);
        }
      }
      _decodeUserBroadcast(buffer, view, decoder) {
        const topicSize = view.getUint8(1);
        const userEventSize = view.getUint8(2);
        const metadataSize = view.getUint8(3);
        const payloadEncoding = view.getUint8(4);
        let offset = this.HEADER_LENGTH + 4;
        const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
        offset = offset + topicSize;
        const userEvent = decoder.decode(buffer.slice(offset, offset + userEventSize));
        offset = offset + userEventSize;
        const metadata = decoder.decode(buffer.slice(offset, offset + metadataSize));
        offset = offset + metadataSize;
        const payload = buffer.slice(offset, buffer.byteLength);
        const parsedPayload = payloadEncoding === this.JSON_ENCODING ? JSON.parse(decoder.decode(payload)) : payload;
        const data = {
          type: this.BROADCAST_EVENT,
          event: userEvent,
          payload: parsedPayload
        };
        if (metadataSize > 0) {
          data["meta"] = JSON.parse(metadata);
        }
        return { join_ref: null, ref: null, topic, event: this.BROADCAST_EVENT, payload: data };
      }
      _isArrayBuffer(buffer) {
        var _a;
        return buffer instanceof ArrayBuffer || ((_a = buffer === null || buffer === void 0 ? void 0 : buffer.constructor) === null || _a === void 0 ? void 0 : _a.name) === "ArrayBuffer";
      }
      _pick(obj, keys) {
        if (!obj || typeof obj !== "object") {
          return {};
        }
        return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
      }
    };
    __name(Serializer, "Serializer");
    exports.default = Serializer;
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/timer.js
var require_timer = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/timer.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var Timer = class {
      constructor(callback, timerCalc) {
        this.callback = callback;
        this.timerCalc = timerCalc;
        this.timer = void 0;
        this.tries = 0;
        this.callback = callback;
        this.timerCalc = timerCalc;
      }
      reset() {
        this.tries = 0;
        clearTimeout(this.timer);
        this.timer = void 0;
      }
      // Cancels any previous scheduleTimeout and schedules callback
      scheduleTimeout() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.tries = this.tries + 1;
          this.callback();
        }, this.timerCalc(this.tries + 1));
      }
    };
    __name(Timer, "Timer");
    exports.default = Timer;
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/transformers.js
var require_transformers = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/transformers.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.httpEndpointURL = exports.toTimestampString = exports.toArray = exports.toJson = exports.toNumber = exports.toBoolean = exports.convertCell = exports.convertColumn = exports.convertChangeData = exports.PostgresTypes = void 0;
    var PostgresTypes;
    (function(PostgresTypes2) {
      PostgresTypes2["abstime"] = "abstime";
      PostgresTypes2["bool"] = "bool";
      PostgresTypes2["date"] = "date";
      PostgresTypes2["daterange"] = "daterange";
      PostgresTypes2["float4"] = "float4";
      PostgresTypes2["float8"] = "float8";
      PostgresTypes2["int2"] = "int2";
      PostgresTypes2["int4"] = "int4";
      PostgresTypes2["int4range"] = "int4range";
      PostgresTypes2["int8"] = "int8";
      PostgresTypes2["int8range"] = "int8range";
      PostgresTypes2["json"] = "json";
      PostgresTypes2["jsonb"] = "jsonb";
      PostgresTypes2["money"] = "money";
      PostgresTypes2["numeric"] = "numeric";
      PostgresTypes2["oid"] = "oid";
      PostgresTypes2["reltime"] = "reltime";
      PostgresTypes2["text"] = "text";
      PostgresTypes2["time"] = "time";
      PostgresTypes2["timestamp"] = "timestamp";
      PostgresTypes2["timestamptz"] = "timestamptz";
      PostgresTypes2["timetz"] = "timetz";
      PostgresTypes2["tsrange"] = "tsrange";
      PostgresTypes2["tstzrange"] = "tstzrange";
    })(PostgresTypes || (exports.PostgresTypes = PostgresTypes = {}));
    var convertChangeData = /* @__PURE__ */ __name((columns, record, options = {}) => {
      var _a;
      const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
      if (!record) {
        return {};
      }
      return Object.keys(record).reduce((acc, rec_key) => {
        acc[rec_key] = (0, exports.convertColumn)(rec_key, columns, record, skipTypes);
        return acc;
      }, {});
    }, "convertChangeData");
    exports.convertChangeData = convertChangeData;
    var convertColumn = /* @__PURE__ */ __name((columnName, columns, record, skipTypes) => {
      const column = columns.find((x) => x.name === columnName);
      const colType = column === null || column === void 0 ? void 0 : column.type;
      const value = record[columnName];
      if (colType && !skipTypes.includes(colType)) {
        return (0, exports.convertCell)(colType, value);
      }
      return noop(value);
    }, "convertColumn");
    exports.convertColumn = convertColumn;
    var convertCell = /* @__PURE__ */ __name((type, value) => {
      if (type.charAt(0) === "_") {
        const dataType = type.slice(1, type.length);
        return (0, exports.toArray)(value, dataType);
      }
      switch (type) {
        case PostgresTypes.bool:
          return (0, exports.toBoolean)(value);
        case PostgresTypes.float4:
        case PostgresTypes.float8:
        case PostgresTypes.int2:
        case PostgresTypes.int4:
        case PostgresTypes.int8:
        case PostgresTypes.numeric:
        case PostgresTypes.oid:
          return (0, exports.toNumber)(value);
        case PostgresTypes.json:
        case PostgresTypes.jsonb:
          return (0, exports.toJson)(value);
        case PostgresTypes.timestamp:
          return (0, exports.toTimestampString)(value);
        case PostgresTypes.abstime:
        case PostgresTypes.date:
        case PostgresTypes.daterange:
        case PostgresTypes.int4range:
        case PostgresTypes.int8range:
        case PostgresTypes.money:
        case PostgresTypes.reltime:
        case PostgresTypes.text:
        case PostgresTypes.time:
        case PostgresTypes.timestamptz:
        case PostgresTypes.timetz:
        case PostgresTypes.tsrange:
        case PostgresTypes.tstzrange:
          return noop(value);
        default:
          return noop(value);
      }
    }, "convertCell");
    exports.convertCell = convertCell;
    var noop = /* @__PURE__ */ __name((value) => {
      return value;
    }, "noop");
    var toBoolean = /* @__PURE__ */ __name((value) => {
      switch (value) {
        case "t":
          return true;
        case "f":
          return false;
        default:
          return value;
      }
    }, "toBoolean");
    exports.toBoolean = toBoolean;
    var toNumber = /* @__PURE__ */ __name((value) => {
      if (typeof value === "string") {
        const parsedValue = parseFloat(value);
        if (!Number.isNaN(parsedValue)) {
          return parsedValue;
        }
      }
      return value;
    }, "toNumber");
    exports.toNumber = toNumber;
    var toJson = /* @__PURE__ */ __name((value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.log(`JSON parse error: ${error}`);
          return value;
        }
      }
      return value;
    }, "toJson");
    exports.toJson = toJson;
    var toArray = /* @__PURE__ */ __name((value, type) => {
      if (typeof value !== "string") {
        return value;
      }
      const lastIdx = value.length - 1;
      const closeBrace = value[lastIdx];
      const openBrace = value[0];
      if (openBrace === "{" && closeBrace === "}") {
        let arr;
        const valTrim = value.slice(1, lastIdx);
        try {
          arr = JSON.parse("[" + valTrim + "]");
        } catch (_) {
          arr = valTrim ? valTrim.split(",") : [];
        }
        return arr.map((val) => (0, exports.convertCell)(type, val));
      }
      return value;
    }, "toArray");
    exports.toArray = toArray;
    var toTimestampString = /* @__PURE__ */ __name((value) => {
      if (typeof value === "string") {
        return value.replace(" ", "T");
      }
      return value;
    }, "toTimestampString");
    exports.toTimestampString = toTimestampString;
    var httpEndpointURL = /* @__PURE__ */ __name((socketUrl) => {
      const wsUrl = new URL(socketUrl);
      wsUrl.protocol = wsUrl.protocol.replace(/^ws/i, "http");
      wsUrl.pathname = wsUrl.pathname.replace(/\/+$/, "").replace(/\/socket\/websocket$/i, "").replace(/\/socket$/i, "").replace(/\/websocket$/i, "");
      if (wsUrl.pathname === "" || wsUrl.pathname === "/") {
        wsUrl.pathname = "/api/broadcast";
      } else {
        wsUrl.pathname = wsUrl.pathname + "/api/broadcast";
      }
      return wsUrl.href;
    }, "httpEndpointURL");
    exports.httpEndpointURL = httpEndpointURL;
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/push.js
var require_push = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/lib/push.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var constants_1 = require_constants();
    var Push = class {
      /**
       * Initializes the Push
       *
       * @param channel The Channel
       * @param event The event, for example `"phx_join"`
       * @param payload The payload, for example `{user_id: 123}`
       * @param timeout The push timeout in milliseconds
       */
      constructor(channel, event, payload = {}, timeout = constants_1.DEFAULT_TIMEOUT) {
        this.channel = channel;
        this.event = event;
        this.payload = payload;
        this.timeout = timeout;
        this.sent = false;
        this.timeoutTimer = void 0;
        this.ref = "";
        this.receivedResp = null;
        this.recHooks = [];
        this.refEvent = null;
      }
      resend(timeout) {
        this.timeout = timeout;
        this._cancelRefEvent();
        this.ref = "";
        this.refEvent = null;
        this.receivedResp = null;
        this.sent = false;
        this.send();
      }
      send() {
        if (this._hasReceived("timeout")) {
          return;
        }
        this.startTimeout();
        this.sent = true;
        this.channel.socket.push({
          topic: this.channel.topic,
          event: this.event,
          payload: this.payload,
          ref: this.ref,
          join_ref: this.channel._joinRef()
        });
      }
      updatePayload(payload) {
        this.payload = Object.assign(Object.assign({}, this.payload), payload);
      }
      receive(status, callback) {
        var _a;
        if (this._hasReceived(status)) {
          callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
        }
        this.recHooks.push({ status, callback });
        return this;
      }
      startTimeout() {
        if (this.timeoutTimer) {
          return;
        }
        this.ref = this.channel.socket._makeRef();
        this.refEvent = this.channel._replyEventName(this.ref);
        const callback = /* @__PURE__ */ __name((payload) => {
          this._cancelRefEvent();
          this._cancelTimeout();
          this.receivedResp = payload;
          this._matchReceive(payload);
        }, "callback");
        this.channel._on(this.refEvent, {}, callback);
        this.timeoutTimer = setTimeout(() => {
          this.trigger("timeout", {});
        }, this.timeout);
      }
      trigger(status, response) {
        if (this.refEvent)
          this.channel._trigger(this.refEvent, { status, response });
      }
      destroy() {
        this._cancelRefEvent();
        this._cancelTimeout();
      }
      _cancelRefEvent() {
        if (!this.refEvent) {
          return;
        }
        this.channel._off(this.refEvent, {});
      }
      _cancelTimeout() {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = void 0;
      }
      _matchReceive({ status, response }) {
        this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response));
      }
      _hasReceived(status) {
        return this.receivedResp && this.receivedResp.status === status;
      }
    };
    __name(Push, "Push");
    exports.default = Push;
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/RealtimePresence.js
var require_RealtimePresence = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/RealtimePresence.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.REALTIME_PRESENCE_LISTEN_EVENTS = void 0;
    var REALTIME_PRESENCE_LISTEN_EVENTS2;
    (function(REALTIME_PRESENCE_LISTEN_EVENTS3) {
      REALTIME_PRESENCE_LISTEN_EVENTS3["SYNC"] = "sync";
      REALTIME_PRESENCE_LISTEN_EVENTS3["JOIN"] = "join";
      REALTIME_PRESENCE_LISTEN_EVENTS3["LEAVE"] = "leave";
    })(REALTIME_PRESENCE_LISTEN_EVENTS2 || (exports.REALTIME_PRESENCE_LISTEN_EVENTS = REALTIME_PRESENCE_LISTEN_EVENTS2 = {}));
    var RealtimePresence2 = class {
      /**
       * Creates a Presence helper that keeps the local presence state in sync with the server.
       *
       * @param channel - The realtime channel to bind to.
       * @param opts - Optional custom event names, e.g. `{ events: { state: 'state', diff: 'diff' } }`.
       *
       * @example
       * ```ts
       * const presence = new RealtimePresence(channel)
       *
       * channel.on('presence', ({ event, key }) => {
       *   console.log(`Presence ${event} on ${key}`)
       * })
       * ```
       */
      constructor(channel, opts) {
        this.channel = channel;
        this.state = {};
        this.pendingDiffs = [];
        this.joinRef = null;
        this.enabled = false;
        this.caller = {
          onJoin: () => {
          },
          onLeave: () => {
          },
          onSync: () => {
          }
        };
        const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
          state: "presence_state",
          diff: "presence_diff"
        };
        this.channel._on(events.state, {}, (newState) => {
          const { onJoin, onLeave, onSync } = this.caller;
          this.joinRef = this.channel._joinRef();
          this.state = RealtimePresence2.syncState(this.state, newState, onJoin, onLeave);
          this.pendingDiffs.forEach((diff) => {
            this.state = RealtimePresence2.syncDiff(this.state, diff, onJoin, onLeave);
          });
          this.pendingDiffs = [];
          onSync();
        });
        this.channel._on(events.diff, {}, (diff) => {
          const { onJoin, onLeave, onSync } = this.caller;
          if (this.inPendingSyncState()) {
            this.pendingDiffs.push(diff);
          } else {
            this.state = RealtimePresence2.syncDiff(this.state, diff, onJoin, onLeave);
            onSync();
          }
        });
        this.onJoin((key, currentPresences, newPresences) => {
          this.channel._trigger("presence", {
            event: "join",
            key,
            currentPresences,
            newPresences
          });
        });
        this.onLeave((key, currentPresences, leftPresences) => {
          this.channel._trigger("presence", {
            event: "leave",
            key,
            currentPresences,
            leftPresences
          });
        });
        this.onSync(() => {
          this.channel._trigger("presence", { event: "sync" });
        });
      }
      /**
       * Used to sync the list of presences on the server with the
       * client's state.
       *
       * An optional `onJoin` and `onLeave` callback can be provided to
       * react to changes in the client's local presences across
       * disconnects and reconnects with the server.
       *
       * @internal
       */
      static syncState(currentState, newState, onJoin, onLeave) {
        const state = this.cloneDeep(currentState);
        const transformedState = this.transformState(newState);
        const joins = {};
        const leaves = {};
        this.map(state, (key, presences) => {
          if (!transformedState[key]) {
            leaves[key] = presences;
          }
        });
        this.map(transformedState, (key, newPresences) => {
          const currentPresences = state[key];
          if (currentPresences) {
            const newPresenceRefs = newPresences.map((m) => m.presence_ref);
            const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
            const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
            const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
            if (joinedPresences.length > 0) {
              joins[key] = joinedPresences;
            }
            if (leftPresences.length > 0) {
              leaves[key] = leftPresences;
            }
          } else {
            joins[key] = newPresences;
          }
        });
        return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
      }
      /**
       * Used to sync a diff of presence join and leave events from the
       * server, as they happen.
       *
       * Like `syncState`, `syncDiff` accepts optional `onJoin` and
       * `onLeave` callbacks to react to a user joining or leaving from a
       * device.
       *
       * @internal
       */
      static syncDiff(state, diff, onJoin, onLeave) {
        const { joins, leaves } = {
          joins: this.transformState(diff.joins),
          leaves: this.transformState(diff.leaves)
        };
        if (!onJoin) {
          onJoin = /* @__PURE__ */ __name(() => {
          }, "onJoin");
        }
        if (!onLeave) {
          onLeave = /* @__PURE__ */ __name(() => {
          }, "onLeave");
        }
        this.map(joins, (key, newPresences) => {
          var _a;
          const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
          state[key] = this.cloneDeep(newPresences);
          if (currentPresences.length > 0) {
            const joinedPresenceRefs = state[key].map((m) => m.presence_ref);
            const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
            state[key].unshift(...curPresences);
          }
          onJoin(key, currentPresences, newPresences);
        });
        this.map(leaves, (key, leftPresences) => {
          let currentPresences = state[key];
          if (!currentPresences)
            return;
          const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
          currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
          state[key] = currentPresences;
          onLeave(key, currentPresences, leftPresences);
          if (currentPresences.length === 0)
            delete state[key];
        });
        return state;
      }
      /** @internal */
      static map(obj, func) {
        return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
      }
      /**
       * Remove 'metas' key
       * Change 'phx_ref' to 'presence_ref'
       * Remove 'phx_ref' and 'phx_ref_prev'
       *
       * @example
       * // returns {
       *  abc123: [
       *    { presence_ref: '2', user_id: 1 },
       *    { presence_ref: '3', user_id: 2 }
       *  ]
       * }
       * RealtimePresence.transformState({
       *  abc123: {
       *    metas: [
       *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
       *      { phx_ref: '3', user_id: 2 }
       *    ]
       *  }
       * })
       *
       * @internal
       */
      static transformState(state) {
        state = this.cloneDeep(state);
        return Object.getOwnPropertyNames(state).reduce((newState, key) => {
          const presences = state[key];
          if ("metas" in presences) {
            newState[key] = presences.metas.map((presence) => {
              presence["presence_ref"] = presence["phx_ref"];
              delete presence["phx_ref"];
              delete presence["phx_ref_prev"];
              return presence;
            });
          } else {
            newState[key] = presences;
          }
          return newState;
        }, {});
      }
      /** @internal */
      static cloneDeep(obj) {
        return JSON.parse(JSON.stringify(obj));
      }
      /** @internal */
      onJoin(callback) {
        this.caller.onJoin = callback;
      }
      /** @internal */
      onLeave(callback) {
        this.caller.onLeave = callback;
      }
      /** @internal */
      onSync(callback) {
        this.caller.onSync = callback;
      }
      /** @internal */
      inPendingSyncState() {
        return !this.joinRef || this.joinRef !== this.channel._joinRef();
      }
    };
    __name(RealtimePresence2, "RealtimePresence");
    exports.default = RealtimePresence2;
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/RealtimeChannel.js
var require_RealtimeChannel = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/RealtimeChannel.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.REALTIME_CHANNEL_STATES = exports.REALTIME_SUBSCRIBE_STATES = exports.REALTIME_LISTEN_TYPES = exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = void 0;
    var tslib_1 = require_tslib();
    var constants_1 = require_constants();
    var push_1 = tslib_1.__importDefault(require_push());
    var timer_1 = tslib_1.__importDefault(require_timer());
    var RealtimePresence_1 = tslib_1.__importDefault(require_RealtimePresence());
    var Transformers = tslib_1.__importStar(require_transformers());
    var transformers_1 = require_transformers();
    var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2;
    (function(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT3) {
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT3["ALL"] = "*";
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT3["INSERT"] = "INSERT";
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT3["UPDATE"] = "UPDATE";
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT3["DELETE"] = "DELETE";
    })(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2 || (exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2 = {}));
    var REALTIME_LISTEN_TYPES2;
    (function(REALTIME_LISTEN_TYPES3) {
      REALTIME_LISTEN_TYPES3["BROADCAST"] = "broadcast";
      REALTIME_LISTEN_TYPES3["PRESENCE"] = "presence";
      REALTIME_LISTEN_TYPES3["POSTGRES_CHANGES"] = "postgres_changes";
      REALTIME_LISTEN_TYPES3["SYSTEM"] = "system";
    })(REALTIME_LISTEN_TYPES2 || (exports.REALTIME_LISTEN_TYPES = REALTIME_LISTEN_TYPES2 = {}));
    var REALTIME_SUBSCRIBE_STATES2;
    (function(REALTIME_SUBSCRIBE_STATES3) {
      REALTIME_SUBSCRIBE_STATES3["SUBSCRIBED"] = "SUBSCRIBED";
      REALTIME_SUBSCRIBE_STATES3["TIMED_OUT"] = "TIMED_OUT";
      REALTIME_SUBSCRIBE_STATES3["CLOSED"] = "CLOSED";
      REALTIME_SUBSCRIBE_STATES3["CHANNEL_ERROR"] = "CHANNEL_ERROR";
    })(REALTIME_SUBSCRIBE_STATES2 || (exports.REALTIME_SUBSCRIBE_STATES = REALTIME_SUBSCRIBE_STATES2 = {}));
    exports.REALTIME_CHANNEL_STATES = constants_1.CHANNEL_STATES;
    var RealtimeChannel2 = class {
      /**
       * Creates a channel that can broadcast messages, sync presence, and listen to Postgres changes.
       *
       * The topic determines which realtime stream you are subscribing to. Config options let you
       * enable acknowledgement for broadcasts, presence tracking, or private channels.
       *
       * @example
       * ```ts
       * import RealtimeClient from '@supabase/realtime-js'
       *
       * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
       *   params: { apikey: 'public-anon-key' },
       * })
       * const channel = new RealtimeChannel('realtime:public:messages', { config: {} }, client)
       * ```
       */
      constructor(topic, params = { config: {} }, socket) {
        var _a, _b;
        this.topic = topic;
        this.params = params;
        this.socket = socket;
        this.bindings = {};
        this.state = constants_1.CHANNEL_STATES.closed;
        this.joinedOnce = false;
        this.pushBuffer = [];
        this.subTopic = topic.replace(/^realtime:/i, "");
        this.params.config = Object.assign({
          broadcast: { ack: false, self: false },
          presence: { key: "", enabled: false },
          private: false
        }, params.config);
        this.timeout = this.socket.timeout;
        this.joinPush = new push_1.default(this, constants_1.CHANNEL_EVENTS.join, this.params, this.timeout);
        this.rejoinTimer = new timer_1.default(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
        this.joinPush.receive("ok", () => {
          this.state = constants_1.CHANNEL_STATES.joined;
          this.rejoinTimer.reset();
          this.pushBuffer.forEach((pushEvent) => pushEvent.send());
          this.pushBuffer = [];
        });
        this._onClose(() => {
          this.rejoinTimer.reset();
          this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`);
          this.state = constants_1.CHANNEL_STATES.closed;
          this.socket._remove(this);
        });
        this._onError((reason) => {
          if (this._isLeaving() || this._isClosed()) {
            return;
          }
          this.socket.log("channel", `error ${this.topic}`, reason);
          this.state = constants_1.CHANNEL_STATES.errored;
          this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive("timeout", () => {
          if (!this._isJoining()) {
            return;
          }
          this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout);
          this.state = constants_1.CHANNEL_STATES.errored;
          this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive("error", (reason) => {
          if (this._isLeaving() || this._isClosed()) {
            return;
          }
          this.socket.log("channel", `error ${this.topic}`, reason);
          this.state = constants_1.CHANNEL_STATES.errored;
          this.rejoinTimer.scheduleTimeout();
        });
        this._on(constants_1.CHANNEL_EVENTS.reply, {}, (payload, ref) => {
          this._trigger(this._replyEventName(ref), payload);
        });
        this.presence = new RealtimePresence_1.default(this);
        this.broadcastEndpointURL = (0, transformers_1.httpEndpointURL)(this.socket.endPoint);
        this.private = this.params.config.private || false;
        if (!this.private && ((_b = (_a = this.params.config) === null || _a === void 0 ? void 0 : _a.broadcast) === null || _b === void 0 ? void 0 : _b.replay)) {
          throw `tried to use replay on public channel '${this.topic}'. It must be a private channel.`;
        }
      }
      /** Subscribe registers your client with the server */
      subscribe(callback, timeout = this.timeout) {
        var _a, _b, _c;
        if (!this.socket.isConnected()) {
          this.socket.connect();
        }
        if (this.state == constants_1.CHANNEL_STATES.closed) {
          const { config: { broadcast, presence, private: isPrivate } } = this.params;
          const postgres_changes = (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [];
          const presence_enabled = !!this.bindings[REALTIME_LISTEN_TYPES2.PRESENCE] && this.bindings[REALTIME_LISTEN_TYPES2.PRESENCE].length > 0 || ((_c = this.params.config.presence) === null || _c === void 0 ? void 0 : _c.enabled) === true;
          const accessTokenPayload = {};
          const config = {
            broadcast,
            presence: Object.assign(Object.assign({}, presence), { enabled: presence_enabled }),
            postgres_changes,
            private: isPrivate
          };
          if (this.socket.accessTokenValue) {
            accessTokenPayload.access_token = this.socket.accessTokenValue;
          }
          this._onError((e) => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES2.CHANNEL_ERROR, e));
          this._onClose(() => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES2.CLOSED));
          this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
          this.joinedOnce = true;
          this._rejoin(timeout);
          this.joinPush.receive("ok", async ({ postgres_changes: postgres_changes2 }) => {
            var _a2;
            this.socket.setAuth();
            if (postgres_changes2 === void 0) {
              callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES2.SUBSCRIBED);
              return;
            } else {
              const clientPostgresBindings = this.bindings.postgres_changes;
              const bindingsLen = (_a2 = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a2 !== void 0 ? _a2 : 0;
              const newPostgresBindings = [];
              for (let i = 0; i < bindingsLen; i++) {
                const clientPostgresBinding = clientPostgresBindings[i];
                const { filter: { event, schema, table, filter } } = clientPostgresBinding;
                const serverPostgresFilter = postgres_changes2 && postgres_changes2[i];
                if (serverPostgresFilter && serverPostgresFilter.event === event && serverPostgresFilter.schema === schema && serverPostgresFilter.table === table && serverPostgresFilter.filter === filter) {
                  newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
                } else {
                  this.unsubscribe();
                  this.state = constants_1.CHANNEL_STATES.errored;
                  callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES2.CHANNEL_ERROR, new Error("mismatch between server and client bindings for postgres changes"));
                  return;
                }
              }
              this.bindings.postgres_changes = newPostgresBindings;
              callback && callback(REALTIME_SUBSCRIBE_STATES2.SUBSCRIBED);
              return;
            }
          }).receive("error", (error) => {
            this.state = constants_1.CHANNEL_STATES.errored;
            callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES2.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(", ") || "error")));
            return;
          }).receive("timeout", () => {
            callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES2.TIMED_OUT);
            return;
          });
        }
        return this;
      }
      /**
       * Returns the current presence state for this channel.
       *
       * The shape is a map keyed by presence key (for example a user id) where each entry contains the
       * tracked metadata for that user.
       */
      presenceState() {
        return this.presence.state;
      }
      /**
       * Sends the supplied payload to the presence tracker so other subscribers can see that this
       * client is online. Use `untrack` to stop broadcasting presence for the same key.
       */
      async track(payload, opts = {}) {
        return await this.send({
          type: "presence",
          event: "track",
          payload
        }, opts.timeout || this.timeout);
      }
      /**
       * Removes the current presence state for this client.
       */
      async untrack(opts = {}) {
        return await this.send({
          type: "presence",
          event: "untrack"
        }, opts);
      }
      on(type, filter, callback) {
        if (this.state === constants_1.CHANNEL_STATES.joined && type === REALTIME_LISTEN_TYPES2.PRESENCE) {
          this.socket.log("channel", `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`);
          this.unsubscribe().then(() => this.subscribe());
        }
        return this._on(type, filter, callback);
      }
      /**
       * Sends a broadcast message explicitly via REST API.
       *
       * This method always uses the REST API endpoint regardless of WebSocket connection state.
       * Useful when you want to guarantee REST delivery or when gradually migrating from implicit REST fallback.
       *
       * @param event The name of the broadcast event
       * @param payload Payload to be sent (required)
       * @param opts Options including timeout
       * @returns Promise resolving to object with success status, and error details if failed
       */
      async httpSend(event, payload, opts = {}) {
        var _a;
        const authorization = this.socket.accessTokenValue ? `Bearer ${this.socket.accessTokenValue}` : "";
        if (payload === void 0 || payload === null) {
          return Promise.reject("Payload is required for httpSend()");
        }
        const options = {
          method: "POST",
          headers: {
            Authorization: authorization,
            apikey: this.socket.apiKey ? this.socket.apiKey : "",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              {
                topic: this.subTopic,
                event,
                payload,
                private: this.private
              }
            ]
          })
        };
        const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
        if (response.status === 202) {
          return { success: true };
        }
        let errorMessage = response.statusText;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorBody.message || errorMessage;
        } catch (_b) {
        }
        return Promise.reject(new Error(errorMessage));
      }
      /**
       * Sends a message into the channel.
       *
       * @param args Arguments to send to channel
       * @param args.type The type of event to send
       * @param args.event The name of the event being sent
       * @param args.payload Payload to be sent
       * @param opts Options to be used during the send process
       */
      async send(args, opts = {}) {
        var _a, _b;
        if (!this._canPush() && args.type === "broadcast") {
          console.warn("Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.");
          const { event, payload: endpoint_payload } = args;
          const authorization = this.socket.accessTokenValue ? `Bearer ${this.socket.accessTokenValue}` : "";
          const options = {
            method: "POST",
            headers: {
              Authorization: authorization,
              apikey: this.socket.apiKey ? this.socket.apiKey : "",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messages: [
                {
                  topic: this.subTopic,
                  event,
                  payload: endpoint_payload,
                  private: this.private
                }
              ]
            })
          };
          try {
            const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
            await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
            return response.ok ? "ok" : "error";
          } catch (error) {
            if (error.name === "AbortError") {
              return "timed out";
            } else {
              return "error";
            }
          }
        } else {
          return new Promise((resolve) => {
            var _a2, _b2, _c;
            const push = this._push(args.type, args, opts.timeout || this.timeout);
            if (args.type === "broadcast" && !((_c = (_b2 = (_a2 = this.params) === null || _a2 === void 0 ? void 0 : _a2.config) === null || _b2 === void 0 ? void 0 : _b2.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
              resolve("ok");
            }
            push.receive("ok", () => resolve("ok"));
            push.receive("error", () => resolve("error"));
            push.receive("timeout", () => resolve("timed out"));
          });
        }
      }
      /**
       * Updates the payload that will be sent the next time the channel joins (reconnects).
       * Useful for rotating access tokens or updating config without re-creating the channel.
       */
      updateJoinPayload(payload) {
        this.joinPush.updatePayload(payload);
      }
      /**
       * Leaves the channel.
       *
       * Unsubscribes from server events, and instructs channel to terminate on server.
       * Triggers onClose() hooks.
       *
       * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
       * channel.unsubscribe().receive("ok", () => alert("left!") )
       */
      unsubscribe(timeout = this.timeout) {
        this.state = constants_1.CHANNEL_STATES.leaving;
        const onClose = /* @__PURE__ */ __name(() => {
          this.socket.log("channel", `leave ${this.topic}`);
          this._trigger(constants_1.CHANNEL_EVENTS.close, "leave", this._joinRef());
        }, "onClose");
        this.joinPush.destroy();
        let leavePush = null;
        return new Promise((resolve) => {
          leavePush = new push_1.default(this, constants_1.CHANNEL_EVENTS.leave, {}, timeout);
          leavePush.receive("ok", () => {
            onClose();
            resolve("ok");
          }).receive("timeout", () => {
            onClose();
            resolve("timed out");
          }).receive("error", () => {
            resolve("error");
          });
          leavePush.send();
          if (!this._canPush()) {
            leavePush.trigger("ok", {});
          }
        }).finally(() => {
          leavePush === null || leavePush === void 0 ? void 0 : leavePush.destroy();
        });
      }
      /**
       * Teardown the channel.
       *
       * Destroys and stops related timers.
       */
      teardown() {
        this.pushBuffer.forEach((push) => push.destroy());
        this.pushBuffer = [];
        this.rejoinTimer.reset();
        this.joinPush.destroy();
        this.state = constants_1.CHANNEL_STATES.closed;
        this.bindings = {};
      }
      /** @internal */
      async _fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
        clearTimeout(id);
        return response;
      }
      /** @internal */
      _push(event, payload, timeout = this.timeout) {
        if (!this.joinedOnce) {
          throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
        }
        let pushEvent = new push_1.default(this, event, payload, timeout);
        if (this._canPush()) {
          pushEvent.send();
        } else {
          this._addToPushBuffer(pushEvent);
        }
        return pushEvent;
      }
      /** @internal */
      _addToPushBuffer(pushEvent) {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
        if (this.pushBuffer.length > constants_1.MAX_PUSH_BUFFER_SIZE) {
          const removedPush = this.pushBuffer.shift();
          if (removedPush) {
            removedPush.destroy();
            this.socket.log("channel", `discarded push due to buffer overflow: ${removedPush.event}`, removedPush.payload);
          }
        }
      }
      /**
       * Overridable message hook
       *
       * Receives all events for specialized message handling before dispatching to the channel callbacks.
       * Must return the payload, modified or unmodified.
       *
       * @internal
       */
      _onMessage(_event, payload, _ref) {
        return payload;
      }
      /** @internal */
      _isMember(topic) {
        return this.topic === topic;
      }
      /** @internal */
      _joinRef() {
        return this.joinPush.ref;
      }
      /** @internal */
      _trigger(type, payload, ref) {
        var _a, _b;
        const typeLower = type.toLocaleLowerCase();
        const { close, error, leave, join } = constants_1.CHANNEL_EVENTS;
        const events = [close, error, leave, join];
        if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
          return;
        }
        let handledPayload = this._onMessage(typeLower, payload, ref);
        if (payload && !handledPayload) {
          throw "channel onMessage callbacks must return the payload, modified or unmodified";
        }
        if (["insert", "update", "delete"].includes(typeLower)) {
          (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
            var _a2, _b2, _c;
            return ((_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event) === "*" || ((_c = (_b2 = bind.filter) === null || _b2 === void 0 ? void 0 : _b2.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
          }).map((bind) => bind.callback(handledPayload, ref));
        } else {
          (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
            var _a2, _b2, _c, _d, _e, _f;
            if (["broadcast", "presence", "postgres_changes"].includes(typeLower)) {
              if ("id" in bind) {
                const bindId = bind.id;
                const bindEvent = (_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event;
                return bindId && ((_b2 = payload.ids) === null || _b2 === void 0 ? void 0 : _b2.includes(bindId)) && (bindEvent === "*" || (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase()));
              } else {
                const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
                return bindEvent === "*" || bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase());
              }
            } else {
              return bind.type.toLocaleLowerCase() === typeLower;
            }
          }).map((bind) => {
            if (typeof handledPayload === "object" && "ids" in handledPayload) {
              const postgresChanges = handledPayload.data;
              const { schema, table, commit_timestamp, type: type2, errors } = postgresChanges;
              const enrichedPayload = {
                schema,
                table,
                commit_timestamp,
                eventType: type2,
                new: {},
                old: {},
                errors
              };
              handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
            }
            bind.callback(handledPayload, ref);
          });
        }
      }
      /** @internal */
      _isClosed() {
        return this.state === constants_1.CHANNEL_STATES.closed;
      }
      /** @internal */
      _isJoined() {
        return this.state === constants_1.CHANNEL_STATES.joined;
      }
      /** @internal */
      _isJoining() {
        return this.state === constants_1.CHANNEL_STATES.joining;
      }
      /** @internal */
      _isLeaving() {
        return this.state === constants_1.CHANNEL_STATES.leaving;
      }
      /** @internal */
      _replyEventName(ref) {
        return `chan_reply_${ref}`;
      }
      /** @internal */
      _on(type, filter, callback) {
        const typeLower = type.toLocaleLowerCase();
        const binding = {
          type: typeLower,
          filter,
          callback
        };
        if (this.bindings[typeLower]) {
          this.bindings[typeLower].push(binding);
        } else {
          this.bindings[typeLower] = [binding];
        }
        return this;
      }
      /** @internal */
      _off(type, filter) {
        const typeLower = type.toLocaleLowerCase();
        if (this.bindings[typeLower]) {
          this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
            var _a;
            return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower && RealtimeChannel2.isEqual(bind.filter, filter));
          });
        }
        return this;
      }
      /** @internal */
      static isEqual(obj1, obj2) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
          return false;
        }
        for (const k in obj1) {
          if (obj1[k] !== obj2[k]) {
            return false;
          }
        }
        return true;
      }
      /** @internal */
      _rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout();
        if (this.socket.isConnected()) {
          this._rejoin();
        }
      }
      /**
       * Registers a callback that will be executed when the channel closes.
       *
       * @internal
       */
      _onClose(callback) {
        this._on(constants_1.CHANNEL_EVENTS.close, {}, callback);
      }
      /**
       * Registers a callback that will be executed when the channel encounteres an error.
       *
       * @internal
       */
      _onError(callback) {
        this._on(constants_1.CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
      }
      /**
       * Returns `true` if the socket is connected and the channel has been joined.
       *
       * @internal
       */
      _canPush() {
        return this.socket.isConnected() && this._isJoined();
      }
      /** @internal */
      _rejoin(timeout = this.timeout) {
        if (this._isLeaving()) {
          return;
        }
        this.socket._leaveOpenTopic(this.topic);
        this.state = constants_1.CHANNEL_STATES.joining;
        this.joinPush.resend(timeout);
      }
      /** @internal */
      _getPayloadRecords(payload) {
        const records = {
          new: {},
          old: {}
        };
        if (payload.type === "INSERT" || payload.type === "UPDATE") {
          records.new = Transformers.convertChangeData(payload.columns, payload.record);
        }
        if (payload.type === "UPDATE" || payload.type === "DELETE") {
          records.old = Transformers.convertChangeData(payload.columns, payload.old_record);
        }
        return records;
      }
    };
    __name(RealtimeChannel2, "RealtimeChannel");
    exports.default = RealtimeChannel2;
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
var require_RealtimeClient = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var websocket_factory_1 = tslib_1.__importDefault(require_websocket_factory());
    var constants_1 = require_constants();
    var serializer_1 = tslib_1.__importDefault(require_serializer());
    var timer_1 = tslib_1.__importDefault(require_timer());
    var transformers_1 = require_transformers();
    var RealtimeChannel_1 = tslib_1.__importDefault(require_RealtimeChannel());
    var noop = /* @__PURE__ */ __name(() => {
    }, "noop");
    var CONNECTION_TIMEOUTS = {
      HEARTBEAT_INTERVAL: 25e3,
      RECONNECT_DELAY: 10,
      HEARTBEAT_TIMEOUT_FALLBACK: 100
    };
    var RECONNECT_INTERVALS = [1e3, 2e3, 5e3, 1e4];
    var DEFAULT_RECONNECT_FALLBACK = 1e4;
    var WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
    var RealtimeClient2 = class {
      /**
       * Initializes the Socket.
       *
       * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
       * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
       * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
       * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
       * @param options.params The optional params to pass when connecting.
       * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
       * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
       * @param options.heartbeatCallback The optional function to handle heartbeat status.
       * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
       * @param options.logLevel Sets the log level for Realtime
       * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
       * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
       * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
       * @param options.worker Use Web Worker to set a side flow. Defaults to false.
       * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
       * @example
       * ```ts
       * import RealtimeClient from '@supabase/realtime-js'
       *
       * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
       *   params: { apikey: 'public-anon-key' },
       * })
       * client.connect()
       * ```
       */
      constructor(endPoint, options) {
        var _a;
        this.accessTokenValue = null;
        this.apiKey = null;
        this.channels = new Array();
        this.endPoint = "";
        this.httpEndpoint = "";
        this.headers = {};
        this.params = {};
        this.timeout = constants_1.DEFAULT_TIMEOUT;
        this.transport = null;
        this.heartbeatIntervalMs = CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.heartbeatTimer = void 0;
        this.pendingHeartbeatRef = null;
        this.heartbeatCallback = noop;
        this.ref = 0;
        this.reconnectTimer = null;
        this.vsn = constants_1.DEFAULT_VSN;
        this.logger = noop;
        this.conn = null;
        this.sendBuffer = [];
        this.serializer = new serializer_1.default();
        this.stateChangeCallbacks = {
          open: [],
          close: [],
          error: [],
          message: []
        };
        this.accessToken = null;
        this._connectionState = "disconnected";
        this._wasManualDisconnect = false;
        this._authPromise = null;
        this._resolveFetch = (customFetch) => {
          if (customFetch) {
            return (...args) => customFetch(...args);
          }
          return (...args) => fetch(...args);
        };
        if (!((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey)) {
          throw new Error("API key is required to connect to Realtime");
        }
        this.apiKey = options.params.apikey;
        this.endPoint = `${endPoint}/${constants_1.TRANSPORTS.websocket}`;
        this.httpEndpoint = (0, transformers_1.httpEndpointURL)(endPoint);
        this._initializeOptions(options);
        this._setupReconnectionTimer();
        this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
      }
      /**
       * Connects the socket, unless already connected.
       */
      connect() {
        if (this.isConnecting() || this.isDisconnecting() || this.conn !== null && this.isConnected()) {
          return;
        }
        this._setConnectionState("connecting");
        if (this.accessToken && !this._authPromise) {
          this._setAuthSafely("connect");
        }
        if (this.transport) {
          this.conn = new this.transport(this.endpointURL());
        } else {
          try {
            this.conn = websocket_factory_1.default.createWebSocket(this.endpointURL());
          } catch (error) {
            this._setConnectionState("disconnected");
            const errorMessage = error.message;
            if (errorMessage.includes("Node.js")) {
              throw new Error(`${errorMessage}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`);
            }
            throw new Error(`WebSocket not available: ${errorMessage}`);
          }
        }
        this._setupConnectionHandlers();
      }
      /**
       * Returns the URL of the websocket.
       * @returns string The URL of the websocket.
       */
      endpointURL() {
        return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: this.vsn }));
      }
      /**
       * Disconnects the socket.
       *
       * @param code A numeric status code to send on disconnect.
       * @param reason A custom reason for the disconnect.
       */
      disconnect(code, reason) {
        if (this.isDisconnecting()) {
          return;
        }
        this._setConnectionState("disconnecting", true);
        if (this.conn) {
          const fallbackTimer = setTimeout(() => {
            this._setConnectionState("disconnected");
          }, 100);
          this.conn.onclose = () => {
            clearTimeout(fallbackTimer);
            this._setConnectionState("disconnected");
          };
          if (typeof this.conn.close === "function") {
            if (code) {
              this.conn.close(code, reason !== null && reason !== void 0 ? reason : "");
            } else {
              this.conn.close();
            }
          }
          this._teardownConnection();
        } else {
          this._setConnectionState("disconnected");
        }
      }
      /**
       * Returns all created channels
       */
      getChannels() {
        return this.channels;
      }
      /**
       * Unsubscribes and removes a single channel
       * @param channel A RealtimeChannel instance
       */
      async removeChannel(channel) {
        const status = await channel.unsubscribe();
        if (this.channels.length === 0) {
          this.disconnect();
        }
        return status;
      }
      /**
       * Unsubscribes and removes all channels
       */
      async removeAllChannels() {
        const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()));
        this.channels = [];
        this.disconnect();
        return values_1;
      }
      /**
       * Logs the message.
       *
       * For customized logging, `this.logger` can be overridden.
       */
      log(kind, msg, data) {
        this.logger(kind, msg, data);
      }
      /**
       * Returns the current state of the socket.
       */
      connectionState() {
        switch (this.conn && this.conn.readyState) {
          case constants_1.SOCKET_STATES.connecting:
            return constants_1.CONNECTION_STATE.Connecting;
          case constants_1.SOCKET_STATES.open:
            return constants_1.CONNECTION_STATE.Open;
          case constants_1.SOCKET_STATES.closing:
            return constants_1.CONNECTION_STATE.Closing;
          default:
            return constants_1.CONNECTION_STATE.Closed;
        }
      }
      /**
       * Returns `true` is the connection is open.
       */
      isConnected() {
        return this.connectionState() === constants_1.CONNECTION_STATE.Open;
      }
      /**
       * Returns `true` if the connection is currently connecting.
       */
      isConnecting() {
        return this._connectionState === "connecting";
      }
      /**
       * Returns `true` if the connection is currently disconnecting.
       */
      isDisconnecting() {
        return this._connectionState === "disconnecting";
      }
      /**
       * Creates (or reuses) a {@link RealtimeChannel} for the provided topic.
       *
       * Topics are automatically prefixed with `realtime:` to match the Realtime service.
       * If a channel with the same topic already exists it will be returned instead of creating
       * a duplicate connection.
       */
      channel(topic, params = { config: {} }) {
        const realtimeTopic = `realtime:${topic}`;
        const exists = this.getChannels().find((c) => c.topic === realtimeTopic);
        if (!exists) {
          const chan = new RealtimeChannel_1.default(`realtime:${topic}`, params, this);
          this.channels.push(chan);
          return chan;
        } else {
          return exists;
        }
      }
      /**
       * Push out a message if the socket is connected.
       *
       * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
       */
      push(data) {
        const { topic, event, payload, ref } = data;
        const callback = /* @__PURE__ */ __name(() => {
          this.encode(data, (result) => {
            var _a;
            (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
          });
        }, "callback");
        this.log("push", `${topic} ${event} (${ref})`, payload);
        if (this.isConnected()) {
          callback();
        } else {
          this.sendBuffer.push(callback);
        }
      }
      /**
       * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
       *
       * If param is null it will use the `accessToken` callback function or the token set on the client.
       *
       * On callback used, it will set the value of the token internal to the client.
       *
       * @param token A JWT string to override the token set on the client.
       */
      async setAuth(token = null) {
        this._authPromise = this._performAuth(token);
        try {
          await this._authPromise;
        } finally {
          this._authPromise = null;
        }
      }
      /**
       * Sends a heartbeat message if the socket is connected.
       */
      async sendHeartbeat() {
        var _a;
        if (!this.isConnected()) {
          try {
            this.heartbeatCallback("disconnected");
          } catch (e) {
            this.log("error", "error in heartbeat callback", e);
          }
          return;
        }
        if (this.pendingHeartbeatRef) {
          this.pendingHeartbeatRef = null;
          this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
          try {
            this.heartbeatCallback("timeout");
          } catch (e) {
            this.log("error", "error in heartbeat callback", e);
          }
          this._wasManualDisconnect = false;
          (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(constants_1.WS_CLOSE_NORMAL, "heartbeat timeout");
          setTimeout(() => {
            var _a2;
            if (!this.isConnected()) {
              (_a2 = this.reconnectTimer) === null || _a2 === void 0 ? void 0 : _a2.scheduleTimeout();
            }
          }, CONNECTION_TIMEOUTS.HEARTBEAT_TIMEOUT_FALLBACK);
          return;
        }
        this.pendingHeartbeatRef = this._makeRef();
        this.push({
          topic: "phoenix",
          event: "heartbeat",
          payload: {},
          ref: this.pendingHeartbeatRef
        });
        try {
          this.heartbeatCallback("sent");
        } catch (e) {
          this.log("error", "error in heartbeat callback", e);
        }
        this._setAuthSafely("heartbeat");
      }
      /**
       * Sets a callback that receives lifecycle events for internal heartbeat messages.
       * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
       */
      onHeartbeat(callback) {
        this.heartbeatCallback = callback;
      }
      /**
       * Flushes send buffer
       */
      flushSendBuffer() {
        if (this.isConnected() && this.sendBuffer.length > 0) {
          this.sendBuffer.forEach((callback) => callback());
          this.sendBuffer = [];
        }
      }
      /**
       * Return the next message ref, accounting for overflows
       *
       * @internal
       */
      _makeRef() {
        let newRef = this.ref + 1;
        if (newRef === this.ref) {
          this.ref = 0;
        } else {
          this.ref = newRef;
        }
        return this.ref.toString();
      }
      /**
       * Unsubscribe from channels with the specified topic.
       *
       * @internal
       */
      _leaveOpenTopic(topic) {
        let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
        if (dupChannel) {
          this.log("transport", `leaving duplicate topic "${topic}"`);
          dupChannel.unsubscribe();
        }
      }
      /**
       * Removes a subscription from the socket.
       *
       * @param channel An open subscription.
       *
       * @internal
       */
      _remove(channel) {
        this.channels = this.channels.filter((c) => c.topic !== channel.topic);
      }
      /** @internal */
      _onConnMessage(rawMessage) {
        this.decode(rawMessage.data, (msg) => {
          if (msg.topic === "phoenix" && msg.event === "phx_reply") {
            try {
              this.heartbeatCallback(msg.payload.status === "ok" ? "ok" : "error");
            } catch (e) {
              this.log("error", "error in heartbeat callback", e);
            }
          }
          if (msg.ref && msg.ref === this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null;
          }
          const { topic, event, payload, ref } = msg;
          const refString = ref ? `(${ref})` : "";
          const status = payload.status || "";
          this.log("receive", `${status} ${topic} ${event} ${refString}`.trim(), payload);
          this.channels.filter((channel) => channel._isMember(topic)).forEach((channel) => channel._trigger(event, payload, ref));
          this._triggerStateCallbacks("message", msg);
        });
      }
      /**
       * Clear specific timer
       * @internal
       */
      _clearTimer(timer) {
        var _a;
        if (timer === "heartbeat" && this.heartbeatTimer) {
          clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = void 0;
        } else if (timer === "reconnect") {
          (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.reset();
        }
      }
      /**
       * Clear all timers
       * @internal
       */
      _clearAllTimers() {
        this._clearTimer("heartbeat");
        this._clearTimer("reconnect");
      }
      /**
       * Setup connection handlers for WebSocket events
       * @internal
       */
      _setupConnectionHandlers() {
        if (!this.conn)
          return;
        if ("binaryType" in this.conn) {
          ;
          this.conn.binaryType = "arraybuffer";
        }
        this.conn.onopen = () => this._onConnOpen();
        this.conn.onerror = (error) => this._onConnError(error);
        this.conn.onmessage = (event) => this._onConnMessage(event);
        this.conn.onclose = (event) => this._onConnClose(event);
      }
      /**
       * Teardown connection and cleanup resources
       * @internal
       */
      _teardownConnection() {
        if (this.conn) {
          if (this.conn.readyState === constants_1.SOCKET_STATES.open || this.conn.readyState === constants_1.SOCKET_STATES.connecting) {
            try {
              this.conn.close();
            } catch (e) {
              this.log("error", "Error closing connection", e);
            }
          }
          this.conn.onopen = null;
          this.conn.onerror = null;
          this.conn.onmessage = null;
          this.conn.onclose = null;
          this.conn = null;
        }
        this._clearAllTimers();
        this.channels.forEach((channel) => channel.teardown());
      }
      /** @internal */
      _onConnOpen() {
        this._setConnectionState("connected");
        this.log("transport", `connected to ${this.endpointURL()}`);
        const authPromise = this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve());
        authPromise.then(() => {
          this.flushSendBuffer();
        }).catch((e) => {
          this.log("error", "error waiting for auth on connect", e);
          this.flushSendBuffer();
        });
        this._clearTimer("reconnect");
        if (!this.worker) {
          this._startHeartbeat();
        } else {
          if (!this.workerRef) {
            this._startWorkerHeartbeat();
          }
        }
        this._triggerStateCallbacks("open");
      }
      /** @internal */
      _startHeartbeat() {
        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
      }
      /** @internal */
      _startWorkerHeartbeat() {
        if (this.workerUrl) {
          this.log("worker", `starting worker for from ${this.workerUrl}`);
        } else {
          this.log("worker", `starting default worker`);
        }
        const objectUrl = this._workerObjectUrl(this.workerUrl);
        this.workerRef = new Worker(objectUrl);
        this.workerRef.onerror = (error) => {
          this.log("worker", "worker error", error.message);
          this.workerRef.terminate();
        };
        this.workerRef.onmessage = (event) => {
          if (event.data.event === "keepAlive") {
            this.sendHeartbeat();
          }
        };
        this.workerRef.postMessage({
          event: "start",
          interval: this.heartbeatIntervalMs
        });
      }
      /** @internal */
      _onConnClose(event) {
        var _a;
        this._setConnectionState("disconnected");
        this.log("transport", "close", event);
        this._triggerChanError();
        this._clearTimer("heartbeat");
        if (!this._wasManualDisconnect) {
          (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout();
        }
        this._triggerStateCallbacks("close", event);
      }
      /** @internal */
      _onConnError(error) {
        this._setConnectionState("disconnected");
        this.log("transport", `${error}`);
        this._triggerChanError();
        this._triggerStateCallbacks("error", error);
      }
      /** @internal */
      _triggerChanError() {
        this.channels.forEach((channel) => channel._trigger(constants_1.CHANNEL_EVENTS.error));
      }
      /** @internal */
      _appendParams(url, params) {
        if (Object.keys(params).length === 0) {
          return url;
        }
        const prefix = url.match(/\?/) ? "&" : "?";
        const query = new URLSearchParams(params);
        return `${url}${prefix}${query}`;
      }
      _workerObjectUrl(url) {
        let result_url;
        if (url) {
          result_url = url;
        } else {
          const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
          result_url = URL.createObjectURL(blob);
        }
        return result_url;
      }
      /**
       * Set connection state with proper state management
       * @internal
       */
      _setConnectionState(state, manual = false) {
        this._connectionState = state;
        if (state === "connecting") {
          this._wasManualDisconnect = false;
        } else if (state === "disconnecting") {
          this._wasManualDisconnect = manual;
        }
      }
      /**
       * Perform the actual auth operation
       * @internal
       */
      async _performAuth(token = null) {
        let tokenToSend;
        if (token) {
          tokenToSend = token;
        } else if (this.accessToken) {
          tokenToSend = await this.accessToken();
        } else {
          tokenToSend = this.accessTokenValue;
        }
        if (this.accessTokenValue != tokenToSend) {
          this.accessTokenValue = tokenToSend;
          this.channels.forEach((channel) => {
            const payload = {
              access_token: tokenToSend,
              version: constants_1.DEFAULT_VERSION
            };
            tokenToSend && channel.updateJoinPayload(payload);
            if (channel.joinedOnce && channel._isJoined()) {
              channel._push(constants_1.CHANNEL_EVENTS.access_token, {
                access_token: tokenToSend
              });
            }
          });
        }
      }
      /**
       * Wait for any in-flight auth operations to complete
       * @internal
       */
      async _waitForAuthIfNeeded() {
        if (this._authPromise) {
          await this._authPromise;
        }
      }
      /**
       * Safely call setAuth with standardized error handling
       * @internal
       */
      _setAuthSafely(context = "general") {
        this.setAuth().catch((e) => {
          this.log("error", `error setting auth in ${context}`, e);
        });
      }
      /**
       * Trigger state change callbacks with proper error handling
       * @internal
       */
      _triggerStateCallbacks(event, data) {
        try {
          this.stateChangeCallbacks[event].forEach((callback) => {
            try {
              callback(data);
            } catch (e) {
              this.log("error", `error in ${event} callback`, e);
            }
          });
        } catch (e) {
          this.log("error", `error triggering ${event} callbacks`, e);
        }
      }
      /**
       * Setup reconnection timer with proper configuration
       * @internal
       */
      _setupReconnectionTimer() {
        this.reconnectTimer = new timer_1.default(async () => {
          setTimeout(async () => {
            await this._waitForAuthIfNeeded();
            if (!this.isConnected()) {
              this.connect();
            }
          }, CONNECTION_TIMEOUTS.RECONNECT_DELAY);
        }, this.reconnectAfterMs);
      }
      /**
       * Initialize client options with defaults
       * @internal
       */
      _initializeOptions(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        this.transport = (_a = options === null || options === void 0 ? void 0 : options.transport) !== null && _a !== void 0 ? _a : null;
        this.timeout = (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null && _b !== void 0 ? _b : constants_1.DEFAULT_TIMEOUT;
        this.heartbeatIntervalMs = (_c = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _c !== void 0 ? _c : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.worker = (_d = options === null || options === void 0 ? void 0 : options.worker) !== null && _d !== void 0 ? _d : false;
        this.accessToken = (_e = options === null || options === void 0 ? void 0 : options.accessToken) !== null && _e !== void 0 ? _e : null;
        this.heartbeatCallback = (_f = options === null || options === void 0 ? void 0 : options.heartbeatCallback) !== null && _f !== void 0 ? _f : noop;
        this.vsn = (_g = options === null || options === void 0 ? void 0 : options.vsn) !== null && _g !== void 0 ? _g : constants_1.DEFAULT_VSN;
        if (options === null || options === void 0 ? void 0 : options.params)
          this.params = options.params;
        if (options === null || options === void 0 ? void 0 : options.logger)
          this.logger = options.logger;
        if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
          this.logLevel = options.logLevel || options.log_level;
          this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel });
        }
        this.reconnectAfterMs = (_h = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _h !== void 0 ? _h : (tries) => {
          return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK;
        };
        switch (this.vsn) {
          case constants_1.VSN_1_0_0:
            this.encode = (_j = options === null || options === void 0 ? void 0 : options.encode) !== null && _j !== void 0 ? _j : (payload, callback) => {
              return callback(JSON.stringify(payload));
            };
            this.decode = (_k = options === null || options === void 0 ? void 0 : options.decode) !== null && _k !== void 0 ? _k : (payload, callback) => {
              return callback(JSON.parse(payload));
            };
            break;
          case constants_1.VSN_2_0_0:
            this.encode = (_l = options === null || options === void 0 ? void 0 : options.encode) !== null && _l !== void 0 ? _l : this.serializer.encode.bind(this.serializer);
            this.decode = (_m = options === null || options === void 0 ? void 0 : options.decode) !== null && _m !== void 0 ? _m : this.serializer.decode.bind(this.serializer);
            break;
          default:
            throw new Error(`Unsupported serializer version: ${this.vsn}`);
        }
        if (this.worker) {
          if (typeof window !== "undefined" && !window.Worker) {
            throw new Error("Web Worker is not supported");
          }
          this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
        }
      }
    };
    __name(RealtimeClient2, "RealtimeClient");
    exports.default = RealtimeClient2;
  }
});

// node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/index.js
var require_main2 = __commonJS({
  "node_modules/.pnpm/@supabase+realtime-js@2.86.2/node_modules/@supabase/realtime-js/dist/main/index.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebSocketFactory = exports.REALTIME_CHANNEL_STATES = exports.REALTIME_SUBSCRIBE_STATES = exports.REALTIME_PRESENCE_LISTEN_EVENTS = exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = exports.REALTIME_LISTEN_TYPES = exports.RealtimeClient = exports.RealtimeChannel = exports.RealtimePresence = void 0;
    var tslib_1 = require_tslib();
    var RealtimeClient_1 = tslib_1.__importDefault(require_RealtimeClient());
    exports.RealtimeClient = RealtimeClient_1.default;
    var RealtimeChannel_1 = tslib_1.__importStar(require_RealtimeChannel());
    exports.RealtimeChannel = RealtimeChannel_1.default;
    Object.defineProperty(exports, "REALTIME_LISTEN_TYPES", { enumerable: true, get: function() {
      return RealtimeChannel_1.REALTIME_LISTEN_TYPES;
    } });
    Object.defineProperty(exports, "REALTIME_POSTGRES_CHANGES_LISTEN_EVENT", { enumerable: true, get: function() {
      return RealtimeChannel_1.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
    } });
    Object.defineProperty(exports, "REALTIME_SUBSCRIBE_STATES", { enumerable: true, get: function() {
      return RealtimeChannel_1.REALTIME_SUBSCRIBE_STATES;
    } });
    Object.defineProperty(exports, "REALTIME_CHANNEL_STATES", { enumerable: true, get: function() {
      return RealtimeChannel_1.REALTIME_CHANNEL_STATES;
    } });
    var RealtimePresence_1 = tslib_1.__importStar(require_RealtimePresence());
    exports.RealtimePresence = RealtimePresence_1.default;
    Object.defineProperty(exports, "REALTIME_PRESENCE_LISTEN_EVENTS", { enumerable: true, get: function() {
      return RealtimePresence_1.REALTIME_PRESENCE_LISTEN_EVENTS;
    } });
    var websocket_factory_1 = tslib_1.__importDefault(require_websocket_factory());
    exports.WebSocketFactory = websocket_factory_1.default;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/errors.js
var require_errors = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/errors.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageUnknownError = exports.StorageApiError = exports.StorageError = void 0;
    exports.isStorageError = isStorageError;
    var StorageError = class extends Error {
      constructor(message) {
        super(message);
        this.__isStorageError = true;
        this.name = "StorageError";
      }
    };
    __name(StorageError, "StorageError");
    exports.StorageError = StorageError;
    function isStorageError(error) {
      return typeof error === "object" && error !== null && "__isStorageError" in error;
    }
    __name(isStorageError, "isStorageError");
    var StorageApiError = class extends StorageError {
      constructor(message, status, statusCode) {
        super(message);
        this.name = "StorageApiError";
        this.status = status;
        this.statusCode = statusCode;
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          statusCode: this.statusCode
        };
      }
    };
    __name(StorageApiError, "StorageApiError");
    exports.StorageApiError = StorageApiError;
    var StorageUnknownError = class extends StorageError {
      constructor(message, originalError) {
        super(message);
        this.name = "StorageUnknownError";
        this.originalError = originalError;
      }
    };
    __name(StorageUnknownError, "StorageUnknownError");
    exports.StorageUnknownError = StorageUnknownError;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/helpers.js
var require_helpers = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/helpers.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isValidBucketName = exports.isPlainObject = exports.recursiveToCamel = exports.resolveResponse = exports.resolveFetch = void 0;
    var resolveFetch = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
    exports.resolveFetch = resolveFetch;
    var resolveResponse = /* @__PURE__ */ __name(() => {
      return Response;
    }, "resolveResponse");
    exports.resolveResponse = resolveResponse;
    var recursiveToCamel = /* @__PURE__ */ __name((item) => {
      if (Array.isArray(item)) {
        return item.map((el) => (0, exports.recursiveToCamel)(el));
      } else if (typeof item === "function" || item !== Object(item)) {
        return item;
      }
      const result = {};
      Object.entries(item).forEach(([key, value]) => {
        const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ""));
        result[newKey] = (0, exports.recursiveToCamel)(value);
      });
      return result;
    }, "recursiveToCamel");
    exports.recursiveToCamel = recursiveToCamel;
    var isPlainObject = /* @__PURE__ */ __name((value) => {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
    }, "isPlainObject");
    exports.isPlainObject = isPlainObject;
    var isValidBucketName = /* @__PURE__ */ __name((bucketName) => {
      if (!bucketName || typeof bucketName !== "string") {
        return false;
      }
      if (bucketName.length === 0 || bucketName.length > 100) {
        return false;
      }
      if (bucketName.trim() !== bucketName) {
        return false;
      }
      if (bucketName.includes("/") || bucketName.includes("\\")) {
        return false;
      }
      const bucketNameRegex = /^[\w!.\*'() &$@=;:+,?-]+$/;
      return bucketNameRegex.test(bucketName);
    }, "isValidBucketName");
    exports.isValidBucketName = isValidBucketName;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/fetch.js
var require_fetch = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/fetch.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.get = get;
    exports.post = post;
    exports.put = put;
    exports.head = head;
    exports.remove = remove;
    var tslib_1 = require_tslib();
    var errors_1 = require_errors();
    var helpers_1 = require_helpers();
    var _getErrorMessage = /* @__PURE__ */ __name((err) => {
      var _a;
      return err.msg || err.message || err.error_description || (typeof err.error === "string" ? err.error : (_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || JSON.stringify(err);
    }, "_getErrorMessage");
    var handleError = /* @__PURE__ */ __name((error, reject, options) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      const Res = yield (0, helpers_1.resolveResponse)();
      if (error instanceof Res && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
        error.json().then((err) => {
          const status = error.status || 500;
          const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || status + "";
          reject(new errors_1.StorageApiError(_getErrorMessage(err), status, statusCode));
        }).catch((err) => {
          reject(new errors_1.StorageUnknownError(_getErrorMessage(err), err));
        });
      } else {
        reject(new errors_1.StorageUnknownError(_getErrorMessage(error), error));
      }
    }), "handleError");
    var _getRequestParams = /* @__PURE__ */ __name((method, options, parameters, body) => {
      const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
      if (method === "GET" || !body) {
        return params;
      }
      if ((0, helpers_1.isPlainObject)(body)) {
        params.headers = Object.assign({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
      } else {
        params.body = body;
      }
      if (options === null || options === void 0 ? void 0 : options.duplex) {
        params.duplex = options.duplex;
      }
      return Object.assign(Object.assign({}, params), parameters);
    }, "_getRequestParams");
    function _handleRequest(fetcher, method, url, options, parameters, body) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
          fetcher(url, _getRequestParams(method, options, parameters, body)).then((result) => {
            if (!result.ok)
              throw result;
            if (options === null || options === void 0 ? void 0 : options.noResolveJson)
              return result;
            return result.json();
          }).then((data) => resolve(data)).catch((error) => handleError(error, reject, options));
        });
      });
    }
    __name(_handleRequest, "_handleRequest");
    function get(fetcher, url, options, parameters) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _handleRequest(fetcher, "GET", url, options, parameters);
      });
    }
    __name(get, "get");
    function post(fetcher, url, body, options, parameters) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _handleRequest(fetcher, "POST", url, options, parameters, body);
      });
    }
    __name(post, "post");
    function put(fetcher, url, body, options, parameters) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _handleRequest(fetcher, "PUT", url, options, parameters, body);
      });
    }
    __name(put, "put");
    function head(fetcher, url, options, parameters) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _handleRequest(fetcher, "HEAD", url, Object.assign(Object.assign({}, options), { noResolveJson: true }), parameters);
      });
    }
    __name(head, "head");
    function remove(fetcher, url, body, options, parameters) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _handleRequest(fetcher, "DELETE", url, options, parameters, body);
      });
    }
    __name(remove, "remove");
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/StreamDownloadBuilder.js
var require_StreamDownloadBuilder = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/StreamDownloadBuilder.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var errors_1 = require_errors();
    var StreamDownloadBuilder = class {
      constructor(downloadFn, shouldThrowOnError) {
        this.downloadFn = downloadFn;
        this.shouldThrowOnError = shouldThrowOnError;
      }
      then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
      }
      execute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const result = yield this.downloadFn();
            return {
              data: result.body,
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(StreamDownloadBuilder, "StreamDownloadBuilder");
    exports.default = StreamDownloadBuilder;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/BlobDownloadBuilder.js
var require_BlobDownloadBuilder = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/BlobDownloadBuilder.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var errors_1 = require_errors();
    var StreamDownloadBuilder_1 = tslib_1.__importDefault(require_StreamDownloadBuilder());
    var BlobDownloadBuilder = class {
      constructor(downloadFn, shouldThrowOnError) {
        this.downloadFn = downloadFn;
        this.shouldThrowOnError = shouldThrowOnError;
        this[_a] = "BlobDownloadBuilder";
        this.promise = null;
      }
      asStream() {
        return new StreamDownloadBuilder_1.default(this.downloadFn, this.shouldThrowOnError);
      }
      then(onfulfilled, onrejected) {
        return this.getPromise().then(onfulfilled, onrejected);
      }
      catch(onrejected) {
        return this.getPromise().catch(onrejected);
      }
      finally(onfinally) {
        return this.getPromise().finally(onfinally);
      }
      getPromise() {
        if (!this.promise) {
          this.promise = this.execute();
        }
        return this.promise;
      }
      execute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const result = yield this.downloadFn();
            return {
              data: yield result.blob(),
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(BlobDownloadBuilder, "BlobDownloadBuilder");
    _a = Symbol.toStringTag;
    exports.default = BlobDownloadBuilder;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/StorageFileApi.js
var require_StorageFileApi = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/StorageFileApi.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var errors_1 = require_errors();
    var fetch_1 = require_fetch();
    var helpers_1 = require_helpers();
    var BlobDownloadBuilder_1 = tslib_1.__importDefault(require_BlobDownloadBuilder());
    var DEFAULT_SEARCH_OPTIONS = {
      limit: 100,
      offset: 0,
      sortBy: {
        column: "name",
        order: "asc"
      }
    };
    var DEFAULT_FILE_OPTIONS = {
      cacheControl: "3600",
      contentType: "text/plain;charset=UTF-8",
      upsert: false
    };
    var StorageFileApi = class {
      constructor(url, headers = {}, bucketId, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url;
        this.headers = headers;
        this.bucketId = bucketId;
        this.fetch = (0, helpers_1.resolveFetch)(fetch2);
      }
      /**
       * Enable throwing errors instead of returning them.
       *
       * @category File Buckets
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
       *
       * @param method HTTP method.
       * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
       * @param fileBody The body of the file to be stored in the bucket.
       */
      uploadOrUpdate(method, path, fileBody, fileOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            let body;
            const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
            let headers = Object.assign(Object.assign({}, this.headers), method === "POST" && { "x-upsert": String(options.upsert) });
            const metadata = options.metadata;
            if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
              body = new FormData();
              body.append("cacheControl", options.cacheControl);
              if (metadata) {
                body.append("metadata", this.encodeMetadata(metadata));
              }
              body.append("", fileBody);
            } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
              body = fileBody;
              if (!body.has("cacheControl")) {
                body.append("cacheControl", options.cacheControl);
              }
              if (metadata && !body.has("metadata")) {
                body.append("metadata", this.encodeMetadata(metadata));
              }
            } else {
              body = fileBody;
              headers["cache-control"] = `max-age=${options.cacheControl}`;
              headers["content-type"] = options.contentType;
              if (metadata) {
                headers["x-metadata"] = this.toBase64(this.encodeMetadata(metadata));
              }
              const isStream = typeof ReadableStream !== "undefined" && body instanceof ReadableStream || body && typeof body === "object" && "pipe" in body && typeof body.pipe === "function";
              if (isStream && !options.duplex) {
                options.duplex = "half";
              }
            }
            if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) {
              headers = Object.assign(Object.assign({}, headers), fileOptions.headers);
            }
            const cleanPath = this._removeEmptyFolders(path);
            const _path = this._getFinalPath(cleanPath);
            const data = yield (method == "PUT" ? fetch_1.put : fetch_1.post)(this.fetch, `${this.url}/object/${_path}`, body, Object.assign({ headers }, (options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {}));
            return {
              data: { path: cleanPath, id: data.Id, fullPath: data.Key },
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Uploads a file to an existing bucket.
       *
       * @category File Buckets
       * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
       * @param fileBody The body of the file to be stored in the bucket.
       * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
       * @returns Promise with response containing file path, id, and fullPath or error
       *
       * @example Upload file
       * ```js
       * const avatarFile = event.target.files[0]
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .upload('public/avatar1.png', avatarFile, {
       *     cacheControl: '3600',
       *     upsert: false
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "public/avatar1.png",
       *     "fullPath": "avatars/public/avatar1.png"
       *   },
       *   "error": null
       * }
       * ```
       *
       * @example Upload file using `ArrayBuffer` from base64 file data
       * ```js
       * import { decode } from 'base64-arraybuffer'
       *
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .upload('public/avatar1.png', decode('base64FileData'), {
       *     contentType: 'image/png'
       *   })
       * ```
       */
      upload(path, fileBody, fileOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
        });
      }
      /**
       * Upload a file with a token generated from `createSignedUploadUrl`.
       *
       * @category File Buckets
       * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
       * @param token The token generated from `createSignedUploadUrl`
       * @param fileBody The body of the file to be stored in the bucket.
       * @param fileOptions HTTP headers (cacheControl, contentType, etc.).
       * **Note:** The `upsert` option has no effect here. To enable upsert behavior,
       * pass `{ upsert: true }` when calling `createSignedUploadUrl()` instead.
       * @returns Promise with response containing file path and fullPath or error
       *
       * @example Upload to a signed URL
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "folder/cat.jpg",
       *     "fullPath": "avatars/folder/cat.jpg"
       *   },
       *   "error": null
       * }
       * ```
       */
      uploadToSignedUrl(path, token, fileBody, fileOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          const cleanPath = this._removeEmptyFolders(path);
          const _path = this._getFinalPath(cleanPath);
          const url = new URL(this.url + `/object/upload/sign/${_path}`);
          url.searchParams.set("token", token);
          try {
            let body;
            const options = Object.assign({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
            const headers = Object.assign(Object.assign({}, this.headers), { "x-upsert": String(options.upsert) });
            if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
              body = new FormData();
              body.append("cacheControl", options.cacheControl);
              body.append("", fileBody);
            } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
              body = fileBody;
              body.append("cacheControl", options.cacheControl);
            } else {
              body = fileBody;
              headers["cache-control"] = `max-age=${options.cacheControl}`;
              headers["content-type"] = options.contentType;
            }
            const data = yield (0, fetch_1.put)(this.fetch, url.toString(), body, { headers });
            return {
              data: { path: cleanPath, fullPath: data.Key },
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Creates a signed upload URL.
       * Signed upload URLs can be used to upload files to the bucket without further authentication.
       * They are valid for 2 hours.
       *
       * @category File Buckets
       * @param path The file path, including the current file name. For example `folder/image.png`.
       * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
       * @returns Promise with response containing signed upload URL, token, and path or error
       *
       * @example Create Signed Upload URL
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUploadUrl('folder/cat.jpg')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "signedUrl": "https://example.supabase.co/storage/v1/object/upload/sign/avatars/folder/cat.jpg?token=<TOKEN>",
       *     "path": "folder/cat.jpg",
       *     "token": "<TOKEN>"
       *   },
       *   "error": null
       * }
       * ```
       */
      createSignedUploadUrl(path, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            let _path = this._getFinalPath(path);
            const headers = Object.assign({}, this.headers);
            if (options === null || options === void 0 ? void 0 : options.upsert) {
              headers["x-upsert"] = "true";
            }
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/object/upload/sign/${_path}`, {}, { headers });
            const url = new URL(this.url + data.url);
            const token = url.searchParams.get("token");
            if (!token) {
              throw new errors_1.StorageError("No token returned by API");
            }
            return { data: { signedUrl: url.toString(), path, token }, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Replaces an existing file at the specified path with a new one.
       *
       * @category File Buckets
       * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
       * @param fileBody The body of the file to be stored in the bucket.
       * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
       * @returns Promise with response containing file path, id, and fullPath or error
       *
       * @example Update file
       * ```js
       * const avatarFile = event.target.files[0]
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .update('public/avatar1.png', avatarFile, {
       *     cacheControl: '3600',
       *     upsert: true
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "public/avatar1.png",
       *     "fullPath": "avatars/public/avatar1.png"
       *   },
       *   "error": null
       * }
       * ```
       *
       * @example Update file using `ArrayBuffer` from base64 file data
       * ```js
       * import {decode} from 'base64-arraybuffer'
       *
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .update('public/avatar1.png', decode('base64FileData'), {
       *     contentType: 'image/png'
       *   })
       * ```
       */
      update(path, fileBody, fileOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
        });
      }
      /**
       * Moves an existing file to a new path in the same bucket.
       *
       * @category File Buckets
       * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
       * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
       * @param options The destination options.
       * @returns Promise with response containing success message or error
       *
       * @example Move file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .move('public/avatar1.png', 'private/avatar2.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully moved"
       *   },
       *   "error": null
       * }
       * ```
       */
      move(fromPath, toPath, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/object/move`, {
              bucketId: this.bucketId,
              sourceKey: fromPath,
              destinationKey: toPath,
              destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
            }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Copies an existing file to a new path in the same bucket.
       *
       * @category File Buckets
       * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
       * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
       * @param options The destination options.
       * @returns Promise with response containing copied file path or error
       *
       * @example Copy file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .copy('public/avatar1.png', 'private/avatar2.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "avatars/private/avatar2.png"
       *   },
       *   "error": null
       * }
       * ```
       */
      copy(fromPath, toPath, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/object/copy`, {
              bucketId: this.bucketId,
              sourceKey: fromPath,
              destinationKey: toPath,
              destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
            }, { headers: this.headers });
            return { data: { path: data.Key }, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
       *
       * @category File Buckets
       * @param path The file path, including the current file name. For example `folder/image.png`.
       * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
       * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
       * @param options.transform Transform the asset before serving it to the client.
       * @returns Promise with response containing signed URL or error
       *
       * @example Create Signed URL
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrl('folder/avatar1.png', 60)
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
       *   },
       *   "error": null
       * }
       * ```
       *
       * @example Create a signed URL for an asset with transformations
       * ```js
       * const { data } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrl('folder/avatar1.png', 60, {
       *     transform: {
       *       width: 100,
       *       height: 100,
       *     }
       *   })
       * ```
       *
       * @example Create a signed URL which triggers the download of the asset
       * ```js
       * const { data } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrl('folder/avatar1.png', 60, {
       *     download: true,
       *   })
       * ```
       */
      createSignedUrl(path, expiresIn, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            let _path = this._getFinalPath(path);
            let data = yield (0, fetch_1.post)(this.fetch, `${this.url}/object/sign/${_path}`, Object.assign({ expiresIn }, (options === null || options === void 0 ? void 0 : options.transform) ? { transform: options.transform } : {}), { headers: this.headers });
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
            const signedUrl = encodeURI(`${this.url}${data.signedURL}${downloadQueryParam}`);
            data = { signedUrl };
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
       *
       * @category File Buckets
       * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
       * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
       * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
       * @returns Promise with response containing array of objects with signedUrl, path, and error or error
       *
       * @example Create Signed URLs
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [
       *     {
       *       "error": null,
       *       "path": "folder/avatar1.png",
       *       "signedURL": "/object/sign/avatars/folder/avatar1.png?token=<TOKEN>",
       *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
       *     },
       *     {
       *       "error": null,
       *       "path": "folder/avatar2.png",
       *       "signedURL": "/object/sign/avatars/folder/avatar2.png?token=<TOKEN>",
       *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar2.png?token=<TOKEN>"
       *     }
       *   ],
       *   "error": null
       * }
       * ```
       */
      createSignedUrls(paths, expiresIn, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn, paths }, { headers: this.headers });
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
            return {
              data: data.map((datum) => Object.assign(Object.assign({}, datum), { signedUrl: datum.signedURL ? encodeURI(`${this.url}${datum.signedURL}${downloadQueryParam}`) : null })),
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
       *
       * @category File Buckets
       * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
       * @param options.transform Transform the asset before serving it to the client.
       * @returns BlobDownloadBuilder instance for downloading the file
       *
       * @example Download file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .download('folder/avatar1.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": <BLOB>,
       *   "error": null
       * }
       * ```
       *
       * @example Download file with transformations
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .download('folder/avatar1.png', {
       *     transform: {
       *       width: 100,
       *       height: 100,
       *       quality: 80
       *     }
       *   })
       * ```
       */
      download(path, options) {
        const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined";
        const renderPath = wantsTransformation ? "render/image/authenticated" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        const queryString = transformationQuery ? `?${transformationQuery}` : "";
        const _path = this._getFinalPath(path);
        const downloadFn = /* @__PURE__ */ __name(() => (0, fetch_1.get)(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
          headers: this.headers,
          noResolveJson: true
        }), "downloadFn");
        return new BlobDownloadBuilder_1.default(downloadFn, this.shouldThrowOnError);
      }
      /**
       * Retrieves the details of an existing file.
       *
       * @category File Buckets
       * @param path The file path, including the file name. For example `folder/image.png`.
       * @returns Promise with response containing file metadata or error
       *
       * @example Get file info
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .info('folder/avatar1.png')
       * ```
       */
      info(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          const _path = this._getFinalPath(path);
          try {
            const data = yield (0, fetch_1.get)(this.fetch, `${this.url}/object/info/${_path}`, {
              headers: this.headers
            });
            return { data: (0, helpers_1.recursiveToCamel)(data), error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Checks the existence of a file.
       *
       * @category File Buckets
       * @param path The file path, including the file name. For example `folder/image.png`.
       * @returns Promise with response containing boolean indicating file existence or error
       *
       * @example Check file existence
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .exists('folder/avatar1.png')
       * ```
       */
      exists(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          const _path = this._getFinalPath(path);
          try {
            yield (0, fetch_1.head)(this.fetch, `${this.url}/object/${_path}`, {
              headers: this.headers
            });
            return { data: true, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error) && error instanceof errors_1.StorageUnknownError) {
              const originalError = error.originalError;
              if ([400, 404].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) {
                return { data: false, error };
              }
            }
            throw error;
          }
        });
      }
      /**
       * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
       * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
       *
       * @category File Buckets
       * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
       * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
       * @param options.transform Transform the asset before serving it to the client.
       * @returns Object with public URL
       *
       * @example Returns the URL for an asset in a public bucket
       * ```js
       * const { data } = supabase
       *   .storage
       *   .from('public-bucket')
       *   .getPublicUrl('folder/avatar1.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "publicUrl": "https://example.supabase.co/storage/v1/object/public/public-bucket/folder/avatar1.png"
       *   }
       * }
       * ```
       *
       * @example Returns the URL for an asset in a public bucket with transformations
       * ```js
       * const { data } = supabase
       *   .storage
       *   .from('public-bucket')
       *   .getPublicUrl('folder/avatar1.png', {
       *     transform: {
       *       width: 100,
       *       height: 100,
       *     }
       *   })
       * ```
       *
       * @example Returns the URL which triggers the download of an asset in a public bucket
       * ```js
       * const { data } = supabase
       *   .storage
       *   .from('public-bucket')
       *   .getPublicUrl('folder/avatar1.png', {
       *     download: true,
       *   })
       * ```
       */
      getPublicUrl(path, options) {
        const _path = this._getFinalPath(path);
        const _queryString = [];
        const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `download=${options.download === true ? "" : options.download}` : "";
        if (downloadQueryParam !== "") {
          _queryString.push(downloadQueryParam);
        }
        const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined";
        const renderPath = wantsTransformation ? "render/image" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        if (transformationQuery !== "") {
          _queryString.push(transformationQuery);
        }
        let queryString = _queryString.join("&");
        if (queryString !== "") {
          queryString = `?${queryString}`;
        }
        return {
          data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) }
        };
      }
      /**
       * Deletes files within the same bucket
       *
       * @category File Buckets
       * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
       * @returns Promise with response containing array of deleted file objects or error
       *
       * @example Delete file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .remove(['folder/avatar1.png'])
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [],
       *   "error": null
       * }
       * ```
       */
      remove(paths) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.remove)(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Get file metadata
       * @param id the file id to retrieve metadata
       */
      // async getMetadata(
      //   id: string
      // ): Promise<
      //   | {
      //       data: Metadata
      //       error: null
      //     }
      //   | {
      //       data: null
      //       error: StorageError
      //     }
      // > {
      //   try {
      //     const data = await get(this.fetch, `${this.url}/metadata/${id}`, { headers: this.headers })
      //     return { data, error: null }
      //   } catch (error) {
      //     if (isStorageError(error)) {
      //       return { data: null, error }
      //     }
      //     throw error
      //   }
      // }
      /**
       * Update file metadata
       * @param id the file id to update metadata
       * @param meta the new file metadata
       */
      // async updateMetadata(
      //   id: string,
      //   meta: Metadata
      // ): Promise<
      //   | {
      //       data: Metadata
      //       error: null
      //     }
      //   | {
      //       data: null
      //       error: StorageError
      //     }
      // > {
      //   try {
      //     const data = await post(
      //       this.fetch,
      //       `${this.url}/metadata/${id}`,
      //       { ...meta },
      //       { headers: this.headers }
      //     )
      //     return { data, error: null }
      //   } catch (error) {
      //     if (isStorageError(error)) {
      //       return { data: null, error }
      //     }
      //     throw error
      //   }
      // }
      /**
       * Lists all the files and folders within a path of the bucket.
       *
       * @category File Buckets
       * @param path The folder path.
       * @param options Search options including limit (defaults to 100), offset, sortBy, and search
       * @param parameters Optional fetch parameters including signal for cancellation
       * @returns Promise with response containing array of files or error
       *
       * @example List files in a bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .list('folder', {
       *     limit: 100,
       *     offset: 0,
       *     sortBy: { column: 'name', order: 'asc' },
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [
       *     {
       *       "name": "avatar1.png",
       *       "id": "e668cf7f-821b-4a2f-9dce-7dfa5dd1cfd2",
       *       "updated_at": "2024-05-22T23:06:05.580Z",
       *       "created_at": "2024-05-22T23:04:34.443Z",
       *       "last_accessed_at": "2024-05-22T23:04:34.443Z",
       *       "metadata": {
       *         "eTag": "\"c5e8c553235d9af30ef4f6e280790b92\"",
       *         "size": 32175,
       *         "mimetype": "image/png",
       *         "cacheControl": "max-age=3600",
       *         "lastModified": "2024-05-22T23:06:05.574Z",
       *         "contentLength": 32175,
       *         "httpStatusCode": 200
       *       }
       *     }
       *   ],
       *   "error": null
       * }
       * ```
       *
       * @example Search files in a bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .list('folder', {
       *     limit: 100,
       *     offset: 0,
       *     sortBy: { column: 'name', order: 'asc' },
       *     search: 'jon'
       *   })
       * ```
       */
      list(path, options, parameters) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || "" });
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * @experimental this method signature might change in the future
       *
       * @category File Buckets
       * @param options search options
       * @param parameters
       */
      listV2(options, parameters) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const body = Object.assign({}, options);
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/object/list-v2/${this.bucketId}`, body, { headers: this.headers }, parameters);
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      encodeMetadata(metadata) {
        return JSON.stringify(metadata);
      }
      toBase64(data) {
        if (typeof Buffer !== "undefined") {
          return Buffer.from(data).toString("base64");
        }
        return btoa(data);
      }
      _getFinalPath(path) {
        return `${this.bucketId}/${path.replace(/^\/+/, "")}`;
      }
      _removeEmptyFolders(path) {
        return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
      }
      transformOptsToQueryString(transform) {
        const params = [];
        if (transform.width) {
          params.push(`width=${transform.width}`);
        }
        if (transform.height) {
          params.push(`height=${transform.height}`);
        }
        if (transform.resize) {
          params.push(`resize=${transform.resize}`);
        }
        if (transform.format) {
          params.push(`format=${transform.format}`);
        }
        if (transform.quality) {
          params.push(`quality=${transform.quality}`);
        }
        return params.join("&");
      }
    };
    __name(StorageFileApi, "StorageFileApi");
    exports.default = StorageFileApi;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/version.js
var require_version2 = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/version.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.version = void 0;
    exports.version = "2.86.2";
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/constants.js
var require_constants2 = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/constants.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_HEADERS = void 0;
    var version_1 = require_version2();
    exports.DEFAULT_HEADERS = {
      "X-Client-Info": `storage-js/${version_1.version}`
    };
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/StorageBucketApi.js
var require_StorageBucketApi = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/StorageBucketApi.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var constants_1 = require_constants2();
    var errors_1 = require_errors();
    var fetch_1 = require_fetch();
    var helpers_1 = require_helpers();
    var StorageBucketApi = class {
      constructor(url, headers = {}, fetch2, opts) {
        this.shouldThrowOnError = false;
        const baseUrl = new URL(url);
        if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
          const isSupabaseHost = /supabase\.(co|in|red)$/.test(baseUrl.hostname);
          if (isSupabaseHost && !baseUrl.hostname.includes("storage.supabase.")) {
            baseUrl.hostname = baseUrl.hostname.replace("supabase.", "storage.supabase.");
          }
        }
        this.url = baseUrl.href.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, constants_1.DEFAULT_HEADERS), headers);
        this.fetch = (0, helpers_1.resolveFetch)(fetch2);
      }
      /**
       * Enable throwing errors instead of returning them.
       *
       * @category File Buckets
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       * Retrieves the details of all Storage buckets within an existing project.
       *
       * @category File Buckets
       * @param options Query parameters for listing buckets
       * @param options.limit Maximum number of buckets to return
       * @param options.offset Number of buckets to skip
       * @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
       * @param options.sortOrder Sort order ('asc' or 'desc')
       * @param options.search Search term to filter bucket names
       * @returns Promise with response containing array of buckets or error
       *
       * @example List buckets
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .listBuckets()
       * ```
       *
       * @example List buckets with options
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .listBuckets({
       *     limit: 10,
       *     offset: 0,
       *     sortColumn: 'created_at',
       *     sortOrder: 'desc',
       *     search: 'prod'
       *   })
       * ```
       */
      listBuckets(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const queryString = this.listBucketOptionsToQueryString(options);
            const data = yield (0, fetch_1.get)(this.fetch, `${this.url}/bucket${queryString}`, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Retrieves the details of an existing Storage bucket.
       *
       * @category File Buckets
       * @param id The unique identifier of the bucket you would like to retrieve.
       * @returns Promise with response containing bucket details or error
       *
       * @example Get bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .getBucket('avatars')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "id": "avatars",
       *     "name": "avatars",
       *     "owner": "",
       *     "public": false,
       *     "file_size_limit": 1024,
       *     "allowed_mime_types": [
       *       "image/png"
       *     ],
       *     "created_at": "2024-05-22T22:26:05.100Z",
       *     "updated_at": "2024-05-22T22:26:05.100Z"
       *   },
       *   "error": null
       * }
       * ```
       */
      getBucket(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.get)(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Creates a new Storage bucket
       *
       * @category File Buckets
       * @param id A unique identifier for the bucket you are creating.
       * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
       * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
       * The global file size limit takes precedence over this value.
       * The default value is null, which doesn't set a per bucket file size limit.
       * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
       * The default value is null, which allows files with all mime types to be uploaded.
       * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
       * @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
       *   - default bucket type is `STANDARD`
       * @returns Promise with response containing newly created bucket name or error
       *
       * @example Create bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .createBucket('avatars', {
       *     public: false,
       *     allowedMimeTypes: ['image/png'],
       *     fileSizeLimit: 1024
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "name": "avatars"
       *   },
       *   "error": null
       * }
       * ```
       */
      createBucket(id_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (id, options = {
          public: false
        }) {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/bucket`, {
              id,
              name: id,
              type: options.type,
              public: options.public,
              file_size_limit: options.fileSizeLimit,
              allowed_mime_types: options.allowedMimeTypes
            }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Updates a Storage bucket
       *
       * @category File Buckets
       * @param id A unique identifier for the bucket you are updating.
       * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
       * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
       * The global file size limit takes precedence over this value.
       * The default value is null, which doesn't set a per bucket file size limit.
       * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
       * The default value is null, which allows files with all mime types to be uploaded.
       * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
       * @returns Promise with response containing success message or error
       *
       * @example Update bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .updateBucket('avatars', {
       *     public: false,
       *     allowedMimeTypes: ['image/png'],
       *     fileSizeLimit: 1024
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully updated"
       *   },
       *   "error": null
       * }
       * ```
       */
      updateBucket(id, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.put)(this.fetch, `${this.url}/bucket/${id}`, {
              id,
              name: id,
              public: options.public,
              file_size_limit: options.fileSizeLimit,
              allowed_mime_types: options.allowedMimeTypes
            }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Removes all objects inside a single bucket.
       *
       * @category File Buckets
       * @param id The unique identifier of the bucket you would like to empty.
       * @returns Promise with success message or error
       *
       * @example Empty bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .emptyBucket('avatars')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully emptied"
       *   },
       *   "error": null
       * }
       * ```
       */
      emptyBucket(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
       * You must first `empty()` the bucket.
       *
       * @category File Buckets
       * @param id The unique identifier of the bucket you would like to delete.
       * @returns Promise with success message or error
       *
       * @example Delete bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .deleteBucket('avatars')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully deleted"
       *   },
       *   "error": null
       * }
       * ```
       */
      deleteBucket(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.remove)(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      listBucketOptionsToQueryString(options) {
        const params = {};
        if (options) {
          if ("limit" in options) {
            params.limit = String(options.limit);
          }
          if ("offset" in options) {
            params.offset = String(options.offset);
          }
          if (options.search) {
            params.search = options.search;
          }
          if (options.sortColumn) {
            params.sortColumn = options.sortColumn;
          }
          if (options.sortOrder) {
            params.sortOrder = options.sortOrder;
          }
        }
        return Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : "";
      }
    };
    __name(StorageBucketApi, "StorageBucketApi");
    exports.default = StorageBucketApi;
  }
});

// node_modules/.pnpm/iceberg-js@0.8.0/node_modules/iceberg-js/dist/index.cjs
var require_dist = __commonJS({
  "node_modules/.pnpm/iceberg-js@0.8.0/node_modules/iceberg-js/dist/index.cjs"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    var IcebergError = /* @__PURE__ */ __name(class extends Error {
      constructor(message, opts) {
        super(message);
        this.name = "IcebergError";
        this.status = opts.status;
        this.icebergType = opts.icebergType;
        this.icebergCode = opts.icebergCode;
        this.details = opts.details;
        this.isCommitStateUnknown = opts.icebergType === "CommitStateUnknownException" || [500, 502, 504].includes(opts.status) && opts.icebergType?.includes("CommitState") === true;
      }
      /**
       * Returns true if the error is a 404 Not Found error.
       */
      isNotFound() {
        return this.status === 404;
      }
      /**
       * Returns true if the error is a 409 Conflict error.
       */
      isConflict() {
        return this.status === 409;
      }
      /**
       * Returns true if the error is a 419 Authentication Timeout error.
       */
      isAuthenticationTimeout() {
        return this.status === 419;
      }
    }, "IcebergError");
    function buildUrl(baseUrl, path, query) {
      const url = new URL(path, baseUrl);
      if (query) {
        for (const [key, value] of Object.entries(query)) {
          if (value !== void 0) {
            url.searchParams.set(key, value);
          }
        }
      }
      return url.toString();
    }
    __name(buildUrl, "buildUrl");
    async function buildAuthHeaders(auth) {
      if (!auth || auth.type === "none") {
        return {};
      }
      if (auth.type === "bearer") {
        return { Authorization: `Bearer ${auth.token}` };
      }
      if (auth.type === "header") {
        return { [auth.name]: auth.value };
      }
      if (auth.type === "custom") {
        return await auth.getHeaders();
      }
      return {};
    }
    __name(buildAuthHeaders, "buildAuthHeaders");
    function createFetchClient(options) {
      const fetchFn = options.fetchImpl ?? globalThis.fetch;
      return {
        async request({
          method,
          path,
          query,
          body,
          headers
        }) {
          const url = buildUrl(options.baseUrl, path, query);
          const authHeaders = await buildAuthHeaders(options.auth);
          const res = await fetchFn(url, {
            method,
            headers: {
              ...body ? { "Content-Type": "application/json" } : {},
              ...authHeaders,
              ...headers
            },
            body: body ? JSON.stringify(body) : void 0
          });
          const text = await res.text();
          const isJson = (res.headers.get("content-type") || "").includes("application/json");
          const data = isJson && text ? JSON.parse(text) : text;
          if (!res.ok) {
            const errBody = isJson ? data : void 0;
            const errorDetail = errBody?.error;
            throw new IcebergError(
              errorDetail?.message ?? `Request failed with status ${res.status}`,
              {
                status: res.status,
                icebergType: errorDetail?.type,
                icebergCode: errorDetail?.code,
                details: errBody
              }
            );
          }
          return { status: res.status, headers: res.headers, data };
        }
      };
    }
    __name(createFetchClient, "createFetchClient");
    function namespaceToPath(namespace) {
      return namespace.join("");
    }
    __name(namespaceToPath, "namespaceToPath");
    var NamespaceOperations = /* @__PURE__ */ __name(class {
      constructor(client, prefix = "") {
        this.client = client;
        this.prefix = prefix;
      }
      async listNamespaces(parent) {
        const query = parent ? { parent: namespaceToPath(parent.namespace) } : void 0;
        const response = await this.client.request({
          method: "GET",
          path: `${this.prefix}/namespaces`,
          query
        });
        return response.data.namespaces.map((ns) => ({ namespace: ns }));
      }
      async createNamespace(id, metadata) {
        const request = {
          namespace: id.namespace,
          properties: metadata?.properties
        };
        const response = await this.client.request({
          method: "POST",
          path: `${this.prefix}/namespaces`,
          body: request
        });
        return response.data;
      }
      async dropNamespace(id) {
        await this.client.request({
          method: "DELETE",
          path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
        });
      }
      async loadNamespaceMetadata(id) {
        const response = await this.client.request({
          method: "GET",
          path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
        });
        return {
          properties: response.data.properties
        };
      }
      async namespaceExists(id) {
        try {
          await this.client.request({
            method: "HEAD",
            path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
          });
          return true;
        } catch (error) {
          if (error instanceof IcebergError && error.status === 404) {
            return false;
          }
          throw error;
        }
      }
      async createNamespaceIfNotExists(id, metadata) {
        try {
          return await this.createNamespace(id, metadata);
        } catch (error) {
          if (error instanceof IcebergError && error.status === 409) {
            return;
          }
          throw error;
        }
      }
    }, "NamespaceOperations");
    function namespaceToPath2(namespace) {
      return namespace.join("");
    }
    __name(namespaceToPath2, "namespaceToPath2");
    var TableOperations = /* @__PURE__ */ __name(class {
      constructor(client, prefix = "", accessDelegation) {
        this.client = client;
        this.prefix = prefix;
        this.accessDelegation = accessDelegation;
      }
      async listTables(namespace) {
        const response = await this.client.request({
          method: "GET",
          path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`
        });
        return response.data.identifiers;
      }
      async createTable(namespace, request) {
        const headers = {};
        if (this.accessDelegation) {
          headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
        }
        const response = await this.client.request({
          method: "POST",
          path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`,
          body: request,
          headers
        });
        return response.data.metadata;
      }
      async updateTable(id, request) {
        const response = await this.client.request({
          method: "POST",
          path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
          body: request
        });
        return {
          "metadata-location": response.data["metadata-location"],
          metadata: response.data.metadata
        };
      }
      async dropTable(id, options) {
        await this.client.request({
          method: "DELETE",
          path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
          query: { purgeRequested: String(options?.purge ?? false) }
        });
      }
      async loadTable(id) {
        const headers = {};
        if (this.accessDelegation) {
          headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
        }
        const response = await this.client.request({
          method: "GET",
          path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
          headers
        });
        return response.data.metadata;
      }
      async tableExists(id) {
        const headers = {};
        if (this.accessDelegation) {
          headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
        }
        try {
          await this.client.request({
            method: "HEAD",
            path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
            headers
          });
          return true;
        } catch (error) {
          if (error instanceof IcebergError && error.status === 404) {
            return false;
          }
          throw error;
        }
      }
      async createTableIfNotExists(namespace, request) {
        try {
          return await this.createTable(namespace, request);
        } catch (error) {
          if (error instanceof IcebergError && error.status === 409) {
            return await this.loadTable({ namespace: namespace.namespace, name: request.name });
          }
          throw error;
        }
      }
    }, "TableOperations");
    var IcebergRestCatalog = /* @__PURE__ */ __name(class {
      /**
       * Creates a new Iceberg REST Catalog client.
       *
       * @param options - Configuration options for the catalog client
       */
      constructor(options) {
        let prefix = "v1";
        if (options.catalogName) {
          prefix += `/${options.catalogName}`;
        }
        const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : `${options.baseUrl}/`;
        this.client = createFetchClient({
          baseUrl,
          auth: options.auth,
          fetchImpl: options.fetch
        });
        this.accessDelegation = options.accessDelegation?.join(",");
        this.namespaceOps = new NamespaceOperations(this.client, prefix);
        this.tableOps = new TableOperations(this.client, prefix, this.accessDelegation);
      }
      /**
       * Lists all namespaces in the catalog.
       *
       * @param parent - Optional parent namespace to list children under
       * @returns Array of namespace identifiers
       *
       * @example
       * ```typescript
       * // List all top-level namespaces
       * const namespaces = await catalog.listNamespaces();
       *
       * // List namespaces under a parent
       * const children = await catalog.listNamespaces({ namespace: ['analytics'] });
       * ```
       */
      async listNamespaces(parent) {
        return this.namespaceOps.listNamespaces(parent);
      }
      /**
       * Creates a new namespace in the catalog.
       *
       * @param id - Namespace identifier to create
       * @param metadata - Optional metadata properties for the namespace
       * @returns Response containing the created namespace and its properties
       *
       * @example
       * ```typescript
       * const response = await catalog.createNamespace(
       *   { namespace: ['analytics'] },
       *   { properties: { owner: 'data-team' } }
       * );
       * console.log(response.namespace); // ['analytics']
       * console.log(response.properties); // { owner: 'data-team', ... }
       * ```
       */
      async createNamespace(id, metadata) {
        return this.namespaceOps.createNamespace(id, metadata);
      }
      /**
       * Drops a namespace from the catalog.
       *
       * The namespace must be empty (contain no tables) before it can be dropped.
       *
       * @param id - Namespace identifier to drop
       *
       * @example
       * ```typescript
       * await catalog.dropNamespace({ namespace: ['analytics'] });
       * ```
       */
      async dropNamespace(id) {
        await this.namespaceOps.dropNamespace(id);
      }
      /**
       * Loads metadata for a namespace.
       *
       * @param id - Namespace identifier to load
       * @returns Namespace metadata including properties
       *
       * @example
       * ```typescript
       * const metadata = await catalog.loadNamespaceMetadata({ namespace: ['analytics'] });
       * console.log(metadata.properties);
       * ```
       */
      async loadNamespaceMetadata(id) {
        return this.namespaceOps.loadNamespaceMetadata(id);
      }
      /**
       * Lists all tables in a namespace.
       *
       * @param namespace - Namespace identifier to list tables from
       * @returns Array of table identifiers
       *
       * @example
       * ```typescript
       * const tables = await catalog.listTables({ namespace: ['analytics'] });
       * console.log(tables); // [{ namespace: ['analytics'], name: 'events' }, ...]
       * ```
       */
      async listTables(namespace) {
        return this.tableOps.listTables(namespace);
      }
      /**
       * Creates a new table in the catalog.
       *
       * @param namespace - Namespace to create the table in
       * @param request - Table creation request including name, schema, partition spec, etc.
       * @returns Table metadata for the created table
       *
       * @example
       * ```typescript
       * const metadata = await catalog.createTable(
       *   { namespace: ['analytics'] },
       *   {
       *     name: 'events',
       *     schema: {
       *       type: 'struct',
       *       fields: [
       *         { id: 1, name: 'id', type: 'long', required: true },
       *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
       *       ],
       *       'schema-id': 0
       *     },
       *     'partition-spec': {
       *       'spec-id': 0,
       *       fields: [
       *         { source_id: 2, field_id: 1000, name: 'ts_day', transform: 'day' }
       *       ]
       *     }
       *   }
       * );
       * ```
       */
      async createTable(namespace, request) {
        return this.tableOps.createTable(namespace, request);
      }
      /**
       * Updates an existing table's metadata.
       *
       * Can update the schema, partition spec, or properties of a table.
       *
       * @param id - Table identifier to update
       * @param request - Update request with fields to modify
       * @returns Response containing the metadata location and updated table metadata
       *
       * @example
       * ```typescript
       * const response = await catalog.updateTable(
       *   { namespace: ['analytics'], name: 'events' },
       *   {
       *     properties: { 'read.split.target-size': '134217728' }
       *   }
       * );
       * console.log(response['metadata-location']); // s3://...
       * console.log(response.metadata); // TableMetadata object
       * ```
       */
      async updateTable(id, request) {
        return this.tableOps.updateTable(id, request);
      }
      /**
       * Drops a table from the catalog.
       *
       * @param id - Table identifier to drop
       *
       * @example
       * ```typescript
       * await catalog.dropTable({ namespace: ['analytics'], name: 'events' });
       * ```
       */
      async dropTable(id, options) {
        await this.tableOps.dropTable(id, options);
      }
      /**
       * Loads metadata for a table.
       *
       * @param id - Table identifier to load
       * @returns Table metadata including schema, partition spec, location, etc.
       *
       * @example
       * ```typescript
       * const metadata = await catalog.loadTable({ namespace: ['analytics'], name: 'events' });
       * console.log(metadata.schema);
       * console.log(metadata.location);
       * ```
       */
      async loadTable(id) {
        return this.tableOps.loadTable(id);
      }
      /**
       * Checks if a namespace exists in the catalog.
       *
       * @param id - Namespace identifier to check
       * @returns True if the namespace exists, false otherwise
       *
       * @example
       * ```typescript
       * const exists = await catalog.namespaceExists({ namespace: ['analytics'] });
       * console.log(exists); // true or false
       * ```
       */
      async namespaceExists(id) {
        return this.namespaceOps.namespaceExists(id);
      }
      /**
       * Checks if a table exists in the catalog.
       *
       * @param id - Table identifier to check
       * @returns True if the table exists, false otherwise
       *
       * @example
       * ```typescript
       * const exists = await catalog.tableExists({ namespace: ['analytics'], name: 'events' });
       * console.log(exists); // true or false
       * ```
       */
      async tableExists(id) {
        return this.tableOps.tableExists(id);
      }
      /**
       * Creates a namespace if it does not exist.
       *
       * If the namespace already exists, returns void. If created, returns the response.
       *
       * @param id - Namespace identifier to create
       * @param metadata - Optional metadata properties for the namespace
       * @returns Response containing the created namespace and its properties, or void if it already exists
       *
       * @example
       * ```typescript
       * const response = await catalog.createNamespaceIfNotExists(
       *   { namespace: ['analytics'] },
       *   { properties: { owner: 'data-team' } }
       * );
       * if (response) {
       *   console.log('Created:', response.namespace);
       * } else {
       *   console.log('Already exists');
       * }
       * ```
       */
      async createNamespaceIfNotExists(id, metadata) {
        return this.namespaceOps.createNamespaceIfNotExists(id, metadata);
      }
      /**
       * Creates a table if it does not exist.
       *
       * If the table already exists, returns its metadata instead.
       *
       * @param namespace - Namespace to create the table in
       * @param request - Table creation request including name, schema, partition spec, etc.
       * @returns Table metadata for the created or existing table
       *
       * @example
       * ```typescript
       * const metadata = await catalog.createTableIfNotExists(
       *   { namespace: ['analytics'] },
       *   {
       *     name: 'events',
       *     schema: {
       *       type: 'struct',
       *       fields: [
       *         { id: 1, name: 'id', type: 'long', required: true },
       *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
       *       ],
       *       'schema-id': 0
       *     }
       *   }
       * );
       * ```
       */
      async createTableIfNotExists(namespace, request) {
        return this.tableOps.createTableIfNotExists(namespace, request);
      }
    }, "IcebergRestCatalog");
    function getCurrentSchema(metadata) {
      return metadata.schemas.find((s) => s["schema-id"] === metadata["current-schema-id"]);
    }
    __name(getCurrentSchema, "getCurrentSchema");
    exports.IcebergError = IcebergError;
    exports.IcebergRestCatalog = IcebergRestCatalog;
    exports.getCurrentSchema = getCurrentSchema;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/StorageAnalyticsClient.js
var require_StorageAnalyticsClient = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/packages/StorageAnalyticsClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var iceberg_js_1 = require_dist();
    var constants_1 = require_constants2();
    var errors_1 = require_errors();
    var fetch_1 = require_fetch();
    var helpers_1 = require_helpers();
    var StorageAnalyticsClient = class {
      /**
       * @alpha
       *
       * Creates a new StorageAnalyticsClient instance
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param url - The base URL for the storage API
       * @param headers - HTTP headers to include in requests
       * @param fetch - Optional custom fetch implementation
       *
       * @example
       * ```typescript
       * const client = new StorageAnalyticsClient(url, headers)
       * ```
       */
      constructor(url, headers = {}, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, constants_1.DEFAULT_HEADERS), headers);
        this.fetch = (0, helpers_1.resolveFetch)(fetch2);
      }
      /**
       * @alpha
       *
       * Enable throwing errors instead of returning them in the response
       * When enabled, failed operations will throw instead of returning { data: null, error }
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @returns This instance for method chaining
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       * @alpha
       *
       * Creates a new analytics bucket using Iceberg tables
       * Analytics buckets are optimized for analytical queries and data processing
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param name A unique name for the bucket you are creating
       * @returns Promise with response containing newly created analytics bucket or error
       *
       * @example Create analytics bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .analytics
       *   .createBucket('analytics-data')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "name": "analytics-data",
       *     "type": "ANALYTICS",
       *     "format": "iceberg",
       *     "created_at": "2024-05-22T22:26:05.100Z",
       *     "updated_at": "2024-05-22T22:26:05.100Z"
       *   },
       *   "error": null
       * }
       * ```
       */
      createBucket(name) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/bucket`, { name }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * @alpha
       *
       * Retrieves the details of all Analytics Storage buckets within an existing project
       * Only returns buckets of type 'ANALYTICS'
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param options Query parameters for listing buckets
       * @param options.limit Maximum number of buckets to return
       * @param options.offset Number of buckets to skip
       * @param options.sortColumn Column to sort by ('name', 'created_at', 'updated_at')
       * @param options.sortOrder Sort order ('asc' or 'desc')
       * @param options.search Search term to filter bucket names
       * @returns Promise with response containing array of analytics buckets or error
       *
       * @example List analytics buckets
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .analytics
       *   .listBuckets({
       *     limit: 10,
       *     offset: 0,
       *     sortColumn: 'created_at',
       *     sortOrder: 'desc'
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [
       *     {
       *       "name": "analytics-data",
       *       "type": "ANALYTICS",
       *       "format": "iceberg",
       *       "created_at": "2024-05-22T22:26:05.100Z",
       *       "updated_at": "2024-05-22T22:26:05.100Z"
       *     }
       *   ],
       *   "error": null
       * }
       * ```
       */
      listBuckets(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const queryParams = new URLSearchParams();
            if ((options === null || options === void 0 ? void 0 : options.limit) !== void 0)
              queryParams.set("limit", options.limit.toString());
            if ((options === null || options === void 0 ? void 0 : options.offset) !== void 0)
              queryParams.set("offset", options.offset.toString());
            if (options === null || options === void 0 ? void 0 : options.sortColumn)
              queryParams.set("sortColumn", options.sortColumn);
            if (options === null || options === void 0 ? void 0 : options.sortOrder)
              queryParams.set("sortOrder", options.sortOrder);
            if (options === null || options === void 0 ? void 0 : options.search)
              queryParams.set("search", options.search);
            const queryString = queryParams.toString();
            const url = queryString ? `${this.url}/bucket?${queryString}` : `${this.url}/bucket`;
            const data = yield (0, fetch_1.get)(this.fetch, url, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * @alpha
       *
       * Deletes an existing analytics bucket
       * A bucket can't be deleted with existing objects inside it
       * You must first empty the bucket before deletion
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param bucketName The unique identifier of the bucket you would like to delete
       * @returns Promise with response containing success message or error
       *
       * @example Delete analytics bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .analytics
       *   .deleteBucket('analytics-data')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully deleted"
       *   },
       *   "error": null
       * }
       * ```
       */
      deleteBucket(bucketName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.remove)(this.fetch, `${this.url}/bucket/${bucketName}`, {}, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * @alpha
       *
       * Get an Iceberg REST Catalog client configured for a specific analytics bucket
       * Use this to perform advanced table and namespace operations within the bucket
       * The returned client provides full access to the Apache Iceberg REST Catalog API
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param bucketName - The name of the analytics bucket (warehouse) to connect to
       * @returns Configured IcebergRestCatalog instance for advanced Iceberg operations
       *
       * @example Get catalog and create table
       * ```js
       * // First, create an analytics bucket
       * const { data: bucket, error: bucketError } = await supabase
       *   .storage
       *   .analytics
       *   .createBucket('analytics-data')
       *
       * // Get the Iceberg catalog for that bucket
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * // Create a namespace
       * await catalog.createNamespace({ namespace: ['default'] })
       *
       * // Create a table with schema
       * await catalog.createTable(
       *   { namespace: ['default'] },
       *   {
       *     name: 'events',
       *     schema: {
       *       type: 'struct',
       *       fields: [
       *         { id: 1, name: 'id', type: 'long', required: true },
       *         { id: 2, name: 'timestamp', type: 'timestamp', required: true },
       *         { id: 3, name: 'user_id', type: 'string', required: false }
       *       ],
       *       'schema-id': 0,
       *       'identifier-field-ids': [1]
       *     },
       *     'partition-spec': {
       *       'spec-id': 0,
       *       fields: []
       *     },
       *     'write-order': {
       *       'order-id': 0,
       *       fields: []
       *     },
       *     properties: {
       *       'write.format.default': 'parquet'
       *     }
       *   }
       * )
       * ```
       *
       * @example List tables in namespace
       * ```js
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * // List all tables in the default namespace
       * const tables = await catalog.listTables({ namespace: ['default'] })
       * console.log(tables) // [{ namespace: ['default'], name: 'events' }]
       * ```
       *
       * @example Working with namespaces
       * ```js
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * // List all namespaces
       * const namespaces = await catalog.listNamespaces()
       *
       * // Create namespace with properties
       * await catalog.createNamespace(
       *   { namespace: ['production'] },
       *   { properties: { owner: 'data-team', env: 'prod' } }
       * )
       * ```
       *
       * @example Cleanup operations
       * ```js
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * // Drop table with purge option (removes all data)
       * await catalog.dropTable(
       *   { namespace: ['default'], name: 'events' },
       *   { purge: true }
       * )
       *
       * // Drop namespace (must be empty)
       * await catalog.dropNamespace({ namespace: ['default'] })
       * ```
       *
       * @example Error handling with catalog operations
       * ```js
       * import { IcebergError } from 'iceberg-js'
       *
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * try {
       *   await catalog.dropTable({ namespace: ['default'], name: 'events' }, { purge: true })
       * } catch (error) {
       *   // Handle 404 errors (resource not found)
       *   const is404 =
       *     (error instanceof IcebergError && error.status === 404) ||
       *     error?.status === 404 ||
       *     error?.details?.error?.code === 404
       *
       *   if (is404) {
       *     console.log('Table does not exist')
       *   } else {
       *     throw error // Re-throw other errors
       *   }
       * }
       * ```
       *
       * @remarks
       * This method provides a bridge between Supabase's bucket management and the standard
       * Apache Iceberg REST Catalog API. The bucket name maps to the Iceberg warehouse parameter.
       * All authentication and configuration is handled automatically using your Supabase credentials.
       *
       * **Error Handling**: Operations may throw `IcebergError` from the iceberg-js library.
       * Always handle 404 errors gracefully when checking for resource existence.
       *
       * **Cleanup Operations**: When using `dropTable`, the `purge: true` option permanently
       * deletes all table data. Without it, the table is marked as deleted but data remains.
       *
       * **Library Dependency**: The returned catalog is an instance of `IcebergRestCatalog`
       * from iceberg-js. For complete API documentation and advanced usage, refer to the
       * [iceberg-js documentation](https://supabase.github.io/iceberg-js/).
       *
       * For advanced Iceberg operations beyond bucket management, you can also install and use
       * the `iceberg-js` package directly with manual configuration.
       */
      from(bucketName) {
        if (!(0, helpers_1.isValidBucketName)(bucketName)) {
          throw new errors_1.StorageError("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
        }
        return new iceberg_js_1.IcebergRestCatalog({
          baseUrl: this.url,
          catalogName: bucketName,
          // Maps to the warehouse parameter in Supabase's implementation
          auth: {
            type: "custom",
            getHeaders: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
              return this.headers;
            })
          },
          fetch: this.fetch
        });
      }
    };
    __name(StorageAnalyticsClient, "StorageAnalyticsClient");
    exports.default = StorageAnalyticsClient;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/constants.js
var require_constants3 = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/constants.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_HEADERS = void 0;
    var version_1 = require_version2();
    exports.DEFAULT_HEADERS = {
      "X-Client-Info": `storage-js/${version_1.version}`,
      "Content-Type": "application/json"
    };
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/errors.js
var require_errors2 = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/errors.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageVectorsErrorCode = exports.StorageVectorsUnknownError = exports.StorageVectorsApiError = exports.StorageVectorsError = void 0;
    exports.isStorageVectorsError = isStorageVectorsError;
    var StorageVectorsError = class extends Error {
      constructor(message) {
        super(message);
        this.__isStorageVectorsError = true;
        this.name = "StorageVectorsError";
      }
    };
    __name(StorageVectorsError, "StorageVectorsError");
    exports.StorageVectorsError = StorageVectorsError;
    function isStorageVectorsError(error) {
      return typeof error === "object" && error !== null && "__isStorageVectorsError" in error;
    }
    __name(isStorageVectorsError, "isStorageVectorsError");
    var StorageVectorsApiError = class extends StorageVectorsError {
      constructor(message, status, statusCode) {
        super(message);
        this.name = "StorageVectorsApiError";
        this.status = status;
        this.statusCode = statusCode;
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          statusCode: this.statusCode
        };
      }
    };
    __name(StorageVectorsApiError, "StorageVectorsApiError");
    exports.StorageVectorsApiError = StorageVectorsApiError;
    var StorageVectorsUnknownError = class extends StorageVectorsError {
      constructor(message, originalError) {
        super(message);
        this.name = "StorageVectorsUnknownError";
        this.originalError = originalError;
      }
    };
    __name(StorageVectorsUnknownError, "StorageVectorsUnknownError");
    exports.StorageVectorsUnknownError = StorageVectorsUnknownError;
    var StorageVectorsErrorCode;
    (function(StorageVectorsErrorCode2) {
      StorageVectorsErrorCode2["InternalError"] = "InternalError";
      StorageVectorsErrorCode2["S3VectorConflictException"] = "S3VectorConflictException";
      StorageVectorsErrorCode2["S3VectorNotFoundException"] = "S3VectorNotFoundException";
      StorageVectorsErrorCode2["S3VectorBucketNotEmpty"] = "S3VectorBucketNotEmpty";
      StorageVectorsErrorCode2["S3VectorMaxBucketsExceeded"] = "S3VectorMaxBucketsExceeded";
      StorageVectorsErrorCode2["S3VectorMaxIndexesExceeded"] = "S3VectorMaxIndexesExceeded";
    })(StorageVectorsErrorCode || (exports.StorageVectorsErrorCode = StorageVectorsErrorCode = {}));
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/helpers.js
var require_helpers2 = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/helpers.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateVectorDimension = exports.normalizeToFloat32 = exports.isPlainObject = exports.resolveResponse = exports.resolveFetch = void 0;
    var resolveFetch = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
    exports.resolveFetch = resolveFetch;
    var resolveResponse = /* @__PURE__ */ __name(() => {
      return Response;
    }, "resolveResponse");
    exports.resolveResponse = resolveResponse;
    var isPlainObject = /* @__PURE__ */ __name((value) => {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
    }, "isPlainObject");
    exports.isPlainObject = isPlainObject;
    var normalizeToFloat32 = /* @__PURE__ */ __name((values) => {
      return Array.from(new Float32Array(values));
    }, "normalizeToFloat32");
    exports.normalizeToFloat32 = normalizeToFloat32;
    var validateVectorDimension = /* @__PURE__ */ __name((vector, expectedDimension) => {
      if (expectedDimension !== void 0 && vector.float32.length !== expectedDimension) {
        throw new Error(`Vector dimension mismatch: expected ${expectedDimension}, got ${vector.float32.length}`);
      }
    }, "validateVectorDimension");
    exports.validateVectorDimension = validateVectorDimension;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/fetch.js
var require_fetch2 = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/fetch.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.get = get;
    exports.post = post;
    exports.put = put;
    exports.remove = remove;
    var tslib_1 = require_tslib();
    var errors_1 = require_errors2();
    var helpers_1 = require_helpers2();
    var _getErrorMessage = /* @__PURE__ */ __name((err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err), "_getErrorMessage");
    var handleError = /* @__PURE__ */ __name((error, reject, options) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      const isResponseLike = error && typeof error === "object" && "status" in error && "ok" in error && typeof error.status === "number";
      if (isResponseLike && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
        const status = error.status || 500;
        const responseError = error;
        if (typeof responseError.json === "function") {
          responseError.json().then((err) => {
            const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || (err === null || err === void 0 ? void 0 : err.code) || status + "";
            reject(new errors_1.StorageVectorsApiError(_getErrorMessage(err), status, statusCode));
          }).catch(() => {
            const statusCode = status + "";
            const message = responseError.statusText || `HTTP ${status} error`;
            reject(new errors_1.StorageVectorsApiError(message, status, statusCode));
          });
        } else {
          const statusCode = status + "";
          const message = responseError.statusText || `HTTP ${status} error`;
          reject(new errors_1.StorageVectorsApiError(message, status, statusCode));
        }
      } else {
        reject(new errors_1.StorageVectorsUnknownError(_getErrorMessage(error), error));
      }
    }), "handleError");
    var _getRequestParams = /* @__PURE__ */ __name((method, options, parameters, body) => {
      const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
      if (method === "GET" || !body) {
        return params;
      }
      if ((0, helpers_1.isPlainObject)(body)) {
        params.headers = Object.assign({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
      } else {
        params.body = body;
      }
      return Object.assign(Object.assign({}, params), parameters);
    }, "_getRequestParams");
    function _handleRequest(fetcher, method, url, options, parameters, body) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
          fetcher(url, _getRequestParams(method, options, parameters, body)).then((result) => {
            if (!result.ok)
              throw result;
            if (options === null || options === void 0 ? void 0 : options.noResolveJson)
              return result;
            const contentType = result.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              return {};
            }
            return result.json();
          }).then((data) => resolve(data)).catch((error) => handleError(error, reject, options));
        });
      });
    }
    __name(_handleRequest, "_handleRequest");
    function get(fetcher, url, options, parameters) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _handleRequest(fetcher, "GET", url, options, parameters);
      });
    }
    __name(get, "get");
    function post(fetcher, url, body, options, parameters) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _handleRequest(fetcher, "POST", url, options, parameters, body);
      });
    }
    __name(post, "post");
    function put(fetcher, url, body, options, parameters) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _handleRequest(fetcher, "PUT", url, options, parameters, body);
      });
    }
    __name(put, "put");
    function remove(fetcher, url, body, options, parameters) {
      return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _handleRequest(fetcher, "DELETE", url, options, parameters, body);
      });
    }
    __name(remove, "remove");
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/VectorIndexApi.js
var require_VectorIndexApi = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/VectorIndexApi.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var constants_1 = require_constants3();
    var errors_1 = require_errors2();
    var fetch_1 = require_fetch2();
    var helpers_1 = require_helpers2();
    var VectorIndexApi = class {
      /** Creates a new VectorIndexApi instance */
      constructor(url, headers = {}, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, constants_1.DEFAULT_HEADERS), headers);
        this.fetch = (0, helpers_1.resolveFetch)(fetch2);
      }
      /** Enable throwing errors instead of returning them in the response */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /** Creates a new vector index within a bucket */
      createIndex(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/CreateIndex`, options, {
              headers: this.headers
            });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Retrieves metadata for a specific vector index */
      getIndex(vectorBucketName, indexName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/GetIndex`, { vectorBucketName, indexName }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Lists vector indexes within a bucket with optional filtering and pagination */
      listIndexes(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/ListIndexes`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Deletes a vector index and all its data */
      deleteIndex(vectorBucketName, indexName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/DeleteIndex`, { vectorBucketName, indexName }, { headers: this.headers });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(VectorIndexApi, "VectorIndexApi");
    exports.default = VectorIndexApi;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/VectorDataApi.js
var require_VectorDataApi = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/VectorDataApi.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var constants_1 = require_constants3();
    var errors_1 = require_errors2();
    var fetch_1 = require_fetch2();
    var helpers_1 = require_helpers2();
    var VectorDataApi = class {
      /** Creates a new VectorDataApi instance */
      constructor(url, headers = {}, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, constants_1.DEFAULT_HEADERS), headers);
        this.fetch = (0, helpers_1.resolveFetch)(fetch2);
      }
      /** Enable throwing errors instead of returning them in the response */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /** Inserts or updates vectors in batch (1-500 per request) */
      putVectors(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            if (options.vectors.length < 1 || options.vectors.length > 500) {
              throw new Error("Vector batch size must be between 1 and 500 items");
            }
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/PutVectors`, options, {
              headers: this.headers
            });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Retrieves vectors by their keys in batch */
      getVectors(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/GetVectors`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Lists vectors in an index with pagination */
      listVectors(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            if (options.segmentCount !== void 0) {
              if (options.segmentCount < 1 || options.segmentCount > 16) {
                throw new Error("segmentCount must be between 1 and 16");
              }
              if (options.segmentIndex !== void 0) {
                if (options.segmentIndex < 0 || options.segmentIndex >= options.segmentCount) {
                  throw new Error(`segmentIndex must be between 0 and ${options.segmentCount - 1}`);
                }
              }
            }
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/ListVectors`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Queries for similar vectors using approximate nearest neighbor search */
      queryVectors(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/QueryVectors`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Deletes vectors by their keys in batch (1-500 per request) */
      deleteVectors(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            if (options.keys.length < 1 || options.keys.length > 500) {
              throw new Error("Keys batch size must be between 1 and 500 items");
            }
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/DeleteVectors`, options, {
              headers: this.headers
            });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(VectorDataApi, "VectorDataApi");
    exports.default = VectorDataApi;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/VectorBucketApi.js
var require_VectorBucketApi = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/VectorBucketApi.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var constants_1 = require_constants3();
    var errors_1 = require_errors2();
    var fetch_1 = require_fetch2();
    var helpers_1 = require_helpers2();
    var VectorBucketApi = class {
      /** Creates a new VectorBucketApi instance */
      constructor(url, headers = {}, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, constants_1.DEFAULT_HEADERS), headers);
        this.fetch = (0, helpers_1.resolveFetch)(fetch2);
      }
      /** Enable throwing errors instead of returning them in the response */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /** Creates a new vector bucket */
      createBucket(vectorBucketName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/CreateVectorBucket`, { vectorBucketName }, { headers: this.headers });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Retrieves metadata for a specific vector bucket */
      getBucket(vectorBucketName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/GetVectorBucket`, { vectorBucketName }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Lists vector buckets with optional filtering and pagination */
      listBuckets() {
        return tslib_1.__awaiter(this, arguments, void 0, function* (options = {}) {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/ListVectorBuckets`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /** Deletes a vector bucket (must be empty first) */
      deleteBucket(vectorBucketName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield (0, fetch_1.post)(this.fetch, `${this.url}/DeleteVectorBucket`, { vectorBucketName }, { headers: this.headers });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if ((0, errors_1.isStorageVectorsError)(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(VectorBucketApi, "VectorBucketApi");
    exports.default = VectorBucketApi;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/StorageVectorsClient.js
var require_StorageVectorsClient = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/StorageVectorsClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VectorIndexScope = exports.VectorBucketScope = exports.StorageVectorsClient = void 0;
    var tslib_1 = require_tslib();
    var VectorIndexApi_1 = tslib_1.__importDefault(require_VectorIndexApi());
    var VectorDataApi_1 = tslib_1.__importDefault(require_VectorDataApi());
    var VectorBucketApi_1 = tslib_1.__importDefault(require_VectorBucketApi());
    var StorageVectorsClient = class extends VectorBucketApi_1.default {
      /**
       * @alpha
       *
       * Creates a StorageVectorsClient that can manage buckets, indexes, and vectors.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param url - Base URL of the Storage Vectors REST API.
       * @param options.headers - Optional headers (for example `Authorization`) applied to every request.
       * @param options.fetch - Optional custom `fetch` implementation for non-browser runtimes.
       *
       * @example
       * ```typescript
       * const client = new StorageVectorsClient(url, options)
       * ```
       */
      constructor(url, options = {}) {
        super(url, options.headers || {}, options.fetch);
      }
      /**
       *
       * @alpha
       *
       * Access operations for a specific vector bucket
       * Returns a scoped client for index and vector operations within the bucket
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the vector bucket
       * @returns Bucket-scoped client with index and vector operations
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * ```
       */
      from(vectorBucketName) {
        return new VectorBucketScope(this.url, this.headers, vectorBucketName, this.fetch);
      }
      /**
       *
       * @alpha
       *
       * Creates a new vector bucket
       * Vector buckets are containers for vector indexes and their data
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Unique name for the vector bucket
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const { data, error } = await supabase
       *   .storage
       *   .vectors
       *   .createBucket('embeddings-prod')
       * ```
       */
      createBucket(vectorBucketName) {
        const _super = Object.create(null, {
          createBucket: { get: () => super.createBucket }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.createBucket.call(this, vectorBucketName);
        });
      }
      /**
       *
       * @alpha
       *
       * Retrieves metadata for a specific vector bucket
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the vector bucket
       * @returns Promise with bucket metadata or error
       *
       * @example
       * ```typescript
       * const { data, error } = await supabase
       *   .storage
       *   .vectors
       *   .getBucket('embeddings-prod')
       *
       * console.log('Bucket created:', data?.vectorBucket.creationTime)
       * ```
       */
      getBucket(vectorBucketName) {
        const _super = Object.create(null, {
          getBucket: { get: () => super.getBucket }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.getBucket.call(this, vectorBucketName);
        });
      }
      /**
       *
       * @alpha
       *
       * Lists all vector buckets with optional filtering and pagination
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Optional filters (prefix, maxResults, nextToken)
       * @returns Promise with list of buckets or error
       *
       * @example
       * ```typescript
       * const { data, error } = await supabase
       *   .storage
       *   .vectors
       *   .listBuckets({ prefix: 'embeddings-' })
       *
       * data?.vectorBuckets.forEach(bucket => {
       *   console.log(bucket.vectorBucketName)
       * })
       * ```
       */
      listBuckets() {
        const _super = Object.create(null, {
          listBuckets: { get: () => super.listBuckets }
        });
        return tslib_1.__awaiter(this, arguments, void 0, function* (options = {}) {
          return _super.listBuckets.call(this, options);
        });
      }
      /**
       *
       * @alpha
       *
       * Deletes a vector bucket (bucket must be empty)
       * All indexes must be deleted before deleting the bucket
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the vector bucket to delete
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const { data, error } = await supabase
       *   .storage
       *   .vectors
       *   .deleteBucket('embeddings-old')
       * ```
       */
      deleteBucket(vectorBucketName) {
        const _super = Object.create(null, {
          deleteBucket: { get: () => super.deleteBucket }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.deleteBucket.call(this, vectorBucketName);
        });
      }
    };
    __name(StorageVectorsClient, "StorageVectorsClient");
    exports.StorageVectorsClient = StorageVectorsClient;
    var VectorBucketScope = class extends VectorIndexApi_1.default {
      /**
       * @alpha
       *
       * Creates a helper that automatically scopes all index operations to the provided bucket.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * ```
       */
      constructor(url, headers, vectorBucketName, fetch2) {
        super(url, headers, fetch2);
        this.vectorBucketName = vectorBucketName;
      }
      /**
       *
       * @alpha
       *
       * Creates a new vector index in this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Index configuration (vectorBucketName is automatically set)
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * await bucket.createIndex({
       *   indexName: 'documents-openai',
       *   dataType: 'float32',
       *   dimension: 1536,
       *   distanceMetric: 'cosine',
       *   metadataConfiguration: {
       *     nonFilterableMetadataKeys: ['raw_text']
       *   }
       * })
       * ```
       */
      createIndex(options) {
        const _super = Object.create(null, {
          createIndex: { get: () => super.createIndex }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.createIndex.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Lists indexes in this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Listing options (vectorBucketName is automatically set)
       * @returns Promise with response containing indexes array and pagination token or error
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * const { data } = await bucket.listIndexes({ prefix: 'documents-' })
       * ```
       */
      listIndexes() {
        const _super = Object.create(null, {
          listIndexes: { get: () => super.listIndexes }
        });
        return tslib_1.__awaiter(this, arguments, void 0, function* (options = {}) {
          return _super.listIndexes.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Retrieves metadata for a specific index in this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param indexName - Name of the index to retrieve
       * @returns Promise with index metadata or error
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * const { data } = await bucket.getIndex('documents-openai')
       * console.log('Dimension:', data?.index.dimension)
       * ```
       */
      getIndex(indexName) {
        const _super = Object.create(null, {
          getIndex: { get: () => super.getIndex }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.getIndex.call(this, this.vectorBucketName, indexName);
        });
      }
      /**
       *
       * @alpha
       *
       * Deletes an index from this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param indexName - Name of the index to delete
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * await bucket.deleteIndex('old-index')
       * ```
       */
      deleteIndex(indexName) {
        const _super = Object.create(null, {
          deleteIndex: { get: () => super.deleteIndex }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.deleteIndex.call(this, this.vectorBucketName, indexName);
        });
      }
      /**
       *
       * @alpha
       *
       * Access operations for a specific index within this bucket
       * Returns a scoped client for vector data operations
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param indexName - Name of the index
       * @returns Index-scoped client with vector data operations
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       *
       * // Insert vectors
       * await index.putVectors({
       *   vectors: [
       *     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
       *   ]
       * })
       *
       * // Query similar vectors
       * const { data } = await index.queryVectors({
       *   queryVector: { float32: [...] },
       *   topK: 5
       * })
       * ```
       */
      index(indexName) {
        return new VectorIndexScope(this.url, this.headers, this.vectorBucketName, indexName, this.fetch);
      }
    };
    __name(VectorBucketScope, "VectorBucketScope");
    exports.VectorBucketScope = VectorBucketScope;
    var VectorIndexScope = class extends VectorDataApi_1.default {
      /**
       *
       * @alpha
       *
       * Creates a helper that automatically scopes all vector operations to the provided bucket/index names.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * ```
       */
      constructor(url, headers, vectorBucketName, indexName, fetch2) {
        super(url, headers, fetch2);
        this.vectorBucketName = vectorBucketName;
        this.indexName = indexName;
      }
      /**
       *
       * @alpha
       *
       * Inserts or updates vectors in this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector insertion options (bucket and index names automatically set)
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * await index.putVectors({
       *   vectors: [
       *     {
       *       key: 'doc-1',
       *       data: { float32: [0.1, 0.2, ...] },
       *       metadata: { title: 'Introduction', page: 1 }
       *     }
       *   ]
       * })
       * ```
       */
      putVectors(options) {
        const _super = Object.create(null, {
          putVectors: { get: () => super.putVectors }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.putVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Retrieves vectors by keys from this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector retrieval options (bucket and index names automatically set)
       * @returns Promise with response containing vectors array or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * const { data } = await index.getVectors({
       *   keys: ['doc-1', 'doc-2'],
       *   returnMetadata: true
       * })
       * ```
       */
      getVectors(options) {
        const _super = Object.create(null, {
          getVectors: { get: () => super.getVectors }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.getVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Lists vectors in this index with pagination
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Listing options (bucket and index names automatically set)
       * @returns Promise with response containing vectors array and pagination token or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * const { data } = await index.listVectors({
       *   maxResults: 500,
       *   returnMetadata: true
       * })
       * ```
       */
      listVectors() {
        const _super = Object.create(null, {
          listVectors: { get: () => super.listVectors }
        });
        return tslib_1.__awaiter(this, arguments, void 0, function* (options = {}) {
          return _super.listVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Queries for similar vectors in this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Query options (bucket and index names automatically set)
       * @returns Promise with response containing matches array of similar vectors ordered by distance or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * const { data } = await index.queryVectors({
       *   queryVector: { float32: [0.1, 0.2, ...] },
       *   topK: 5,
       *   filter: { category: 'technical' },
       *   returnDistance: true,
       *   returnMetadata: true
       * })
       * ```
       */
      queryVectors(options) {
        const _super = Object.create(null, {
          queryVectors: { get: () => super.queryVectors }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.queryVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Deletes vectors by keys from this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Deletion options (bucket and index names automatically set)
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * await index.deleteVectors({
       *   keys: ['doc-1', 'doc-2', 'doc-3']
       * })
       * ```
       */
      deleteVectors(options) {
        const _super = Object.create(null, {
          deleteVectors: { get: () => super.deleteVectors }
        });
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
          return _super.deleteVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
    };
    __name(VectorIndexScope, "VectorIndexScope");
    exports.VectorIndexScope = VectorIndexScope;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/index.js
var require_vectors = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/vectors/index.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateVectorDimension = exports.normalizeToFloat32 = exports.isPlainObject = exports.resolveResponse = exports.resolveFetch = exports.isStorageVectorsError = exports.StorageVectorsErrorCode = exports.StorageVectorsUnknownError = exports.StorageVectorsApiError = exports.StorageVectorsError = exports.VectorDataApi = exports.VectorIndexApi = exports.VectorBucketApi = exports.VectorIndexScope = exports.VectorBucketScope = exports.StorageVectorsClient = void 0;
    var tslib_1 = require_tslib();
    var StorageVectorsClient_1 = require_StorageVectorsClient();
    Object.defineProperty(exports, "StorageVectorsClient", { enumerable: true, get: function() {
      return StorageVectorsClient_1.StorageVectorsClient;
    } });
    Object.defineProperty(exports, "VectorBucketScope", { enumerable: true, get: function() {
      return StorageVectorsClient_1.VectorBucketScope;
    } });
    Object.defineProperty(exports, "VectorIndexScope", { enumerable: true, get: function() {
      return StorageVectorsClient_1.VectorIndexScope;
    } });
    var VectorBucketApi_1 = require_VectorBucketApi();
    Object.defineProperty(exports, "VectorBucketApi", { enumerable: true, get: function() {
      return tslib_1.__importDefault(VectorBucketApi_1).default;
    } });
    var VectorIndexApi_1 = require_VectorIndexApi();
    Object.defineProperty(exports, "VectorIndexApi", { enumerable: true, get: function() {
      return tslib_1.__importDefault(VectorIndexApi_1).default;
    } });
    var VectorDataApi_1 = require_VectorDataApi();
    Object.defineProperty(exports, "VectorDataApi", { enumerable: true, get: function() {
      return tslib_1.__importDefault(VectorDataApi_1).default;
    } });
    var errors_1 = require_errors2();
    Object.defineProperty(exports, "StorageVectorsError", { enumerable: true, get: function() {
      return errors_1.StorageVectorsError;
    } });
    Object.defineProperty(exports, "StorageVectorsApiError", { enumerable: true, get: function() {
      return errors_1.StorageVectorsApiError;
    } });
    Object.defineProperty(exports, "StorageVectorsUnknownError", { enumerable: true, get: function() {
      return errors_1.StorageVectorsUnknownError;
    } });
    Object.defineProperty(exports, "StorageVectorsErrorCode", { enumerable: true, get: function() {
      return errors_1.StorageVectorsErrorCode;
    } });
    Object.defineProperty(exports, "isStorageVectorsError", { enumerable: true, get: function() {
      return errors_1.isStorageVectorsError;
    } });
    var helpers_1 = require_helpers2();
    Object.defineProperty(exports, "resolveFetch", { enumerable: true, get: function() {
      return helpers_1.resolveFetch;
    } });
    Object.defineProperty(exports, "resolveResponse", { enumerable: true, get: function() {
      return helpers_1.resolveResponse;
    } });
    Object.defineProperty(exports, "isPlainObject", { enumerable: true, get: function() {
      return helpers_1.isPlainObject;
    } });
    Object.defineProperty(exports, "normalizeToFloat32", { enumerable: true, get: function() {
      return helpers_1.normalizeToFloat32;
    } });
    Object.defineProperty(exports, "validateVectorDimension", { enumerable: true, get: function() {
      return helpers_1.validateVectorDimension;
    } });
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/StorageClient.js
var require_StorageClient = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/StorageClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageClient = void 0;
    var tslib_1 = require_tslib();
    var StorageFileApi_1 = tslib_1.__importDefault(require_StorageFileApi());
    var StorageBucketApi_1 = tslib_1.__importDefault(require_StorageBucketApi());
    var StorageAnalyticsClient_1 = tslib_1.__importDefault(require_StorageAnalyticsClient());
    var vectors_1 = require_vectors();
    var StorageClient = class extends StorageBucketApi_1.default {
      /**
       * Creates a client for Storage buckets, files, analytics, and vectors.
       *
       * @category File Buckets
       * @example
       * ```ts
       * import { StorageClient } from '@supabase/storage-js'
       *
       * const storage = new StorageClient('https://xyzcompany.supabase.co/storage/v1', {
       *   apikey: 'public-anon-key',
       * })
       * const avatars = storage.from('avatars')
       * ```
       */
      constructor(url, headers = {}, fetch2, opts) {
        super(url, headers, fetch2, opts);
      }
      /**
       * Perform file operation in a bucket.
       *
       * @category File Buckets
       * @param id The bucket id to operate on.
       *
       * @example
       * ```typescript
       * const avatars = supabase.storage.from('avatars')
       * ```
       */
      from(id) {
        return new StorageFileApi_1.default(this.url, this.headers, id, this.fetch);
      }
      /**
       *
       * @alpha
       *
       * Access vector storage operations.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @returns A StorageVectorsClient instance configured with the current storage settings.
       */
      get vectors() {
        return new vectors_1.StorageVectorsClient(this.url + "/vector", {
          headers: this.headers,
          fetch: this.fetch
        });
      }
      /**
       *
       * @alpha
       *
       * Access analytics storage operations using Iceberg tables.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @returns A StorageAnalyticsClient instance configured with the current storage settings.
       */
      get analytics() {
        return new StorageAnalyticsClient_1.default(this.url + "/iceberg", this.headers, this.fetch);
      }
    };
    __name(StorageClient, "StorageClient");
    exports.StorageClient = StorageClient;
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/types.js
var require_types2 = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/lib/types.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/index.js
var require_main3 = __commonJS({
  "node_modules/.pnpm/@supabase+storage-js@2.86.2/node_modules/@supabase/storage-js/dist/main/index.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageAnalyticsClient = exports.StorageClient = void 0;
    var tslib_1 = require_tslib();
    var StorageClient_1 = require_StorageClient();
    Object.defineProperty(exports, "StorageClient", { enumerable: true, get: function() {
      return StorageClient_1.StorageClient;
    } });
    var StorageAnalyticsClient_1 = require_StorageAnalyticsClient();
    Object.defineProperty(exports, "StorageAnalyticsClient", { enumerable: true, get: function() {
      return tslib_1.__importDefault(StorageAnalyticsClient_1).default;
    } });
    tslib_1.__exportStar(require_types2(), exports);
    tslib_1.__exportStar(require_errors(), exports);
    tslib_1.__exportStar(require_vectors(), exports);
  }
});

// node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/version.js
var require_version3 = __commonJS({
  "node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/version.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.version = void 0;
    exports.version = "2.86.2";
  }
});

// node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/constants.js
var require_constants4 = __commonJS({
  "node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/constants.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_REALTIME_OPTIONS = exports.DEFAULT_AUTH_OPTIONS = exports.DEFAULT_DB_OPTIONS = exports.DEFAULT_GLOBAL_OPTIONS = exports.DEFAULT_HEADERS = void 0;
    var version_1 = require_version3();
    var JS_ENV = "";
    if (typeof Deno !== "undefined") {
      JS_ENV = "deno";
    } else if (typeof document !== "undefined") {
      JS_ENV = "web";
    } else if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
      JS_ENV = "react-native";
    } else {
      JS_ENV = "node";
    }
    exports.DEFAULT_HEADERS = { "X-Client-Info": `supabase-js-${JS_ENV}/${version_1.version}` };
    exports.DEFAULT_GLOBAL_OPTIONS = {
      headers: exports.DEFAULT_HEADERS
    };
    exports.DEFAULT_DB_OPTIONS = {
      schema: "public"
    };
    exports.DEFAULT_AUTH_OPTIONS = {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "implicit"
    };
    exports.DEFAULT_REALTIME_OPTIONS = {};
  }
});

// node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/fetch.js
var require_fetch3 = __commonJS({
  "node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/fetch.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fetchWithAuth = exports.resolveHeadersConstructor = exports.resolveFetch = void 0;
    var resolveFetch = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
    exports.resolveFetch = resolveFetch;
    var resolveHeadersConstructor = /* @__PURE__ */ __name(() => {
      return Headers;
    }, "resolveHeadersConstructor");
    exports.resolveHeadersConstructor = resolveHeadersConstructor;
    var fetchWithAuth = /* @__PURE__ */ __name((supabaseKey, getAccessToken, customFetch) => {
      const fetch2 = (0, exports.resolveFetch)(customFetch);
      const HeadersConstructor = (0, exports.resolveHeadersConstructor)();
      return async (input, init) => {
        var _a;
        const accessToken = (_a = await getAccessToken()) !== null && _a !== void 0 ? _a : supabaseKey;
        let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
        if (!headers.has("apikey")) {
          headers.set("apikey", supabaseKey);
        }
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return fetch2(input, Object.assign(Object.assign({}, init), { headers }));
      };
    }, "fetchWithAuth");
    exports.fetchWithAuth = fetchWithAuth;
  }
});

// node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/helpers.js
var require_helpers3 = __commonJS({
  "node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/helpers.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isBrowser = void 0;
    exports.uuid = uuid;
    exports.ensureTrailingSlash = ensureTrailingSlash;
    exports.applySettingDefaults = applySettingDefaults;
    exports.validateSupabaseUrl = validateSupabaseUrl;
    function uuid() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    }
    __name(uuid, "uuid");
    function ensureTrailingSlash(url) {
      return url.endsWith("/") ? url : url + "/";
    }
    __name(ensureTrailingSlash, "ensureTrailingSlash");
    var isBrowser = /* @__PURE__ */ __name(() => typeof window !== "undefined", "isBrowser");
    exports.isBrowser = isBrowser;
    function applySettingDefaults(options, defaults) {
      var _a, _b;
      const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
      const { db: DEFAULT_DB_OPTIONS, auth: DEFAULT_AUTH_OPTIONS, realtime: DEFAULT_REALTIME_OPTIONS, global: DEFAULT_GLOBAL_OPTIONS } = defaults;
      const result = {
        db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS), dbOptions),
        auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), authOptions),
        realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS), realtimeOptions),
        storage: {},
        global: Object.assign(Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS), globalOptions), { headers: Object.assign(Object.assign({}, (_a = DEFAULT_GLOBAL_OPTIONS === null || DEFAULT_GLOBAL_OPTIONS === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS.headers) !== null && _a !== void 0 ? _a : {}), (_b = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _b !== void 0 ? _b : {}) }),
        accessToken: async () => ""
      };
      if (options.accessToken) {
        result.accessToken = options.accessToken;
      } else {
        delete result.accessToken;
      }
      return result;
    }
    __name(applySettingDefaults, "applySettingDefaults");
    function validateSupabaseUrl(supabaseUrl) {
      const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim();
      if (!trimmedUrl) {
        throw new Error("supabaseUrl is required.");
      }
      if (!trimmedUrl.match(/^https?:\/\//i)) {
        throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
      }
      try {
        return new URL(ensureTrailingSlash(trimmedUrl));
      } catch (_a) {
        throw Error("Invalid supabaseUrl: Provided URL is malformed.");
      }
    }
    __name(validateSupabaseUrl, "validateSupabaseUrl");
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/version.js
var require_version4 = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/version.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.version = void 0;
    exports.version = "2.86.2";
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/constants.js
var require_constants5 = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/constants.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JWKS_TTL = exports.BASE64URL_REGEX = exports.API_VERSIONS = exports.API_VERSION_HEADER_NAME = exports.NETWORK_FAILURE = exports.DEFAULT_HEADERS = exports.AUDIENCE = exports.STORAGE_KEY = exports.GOTRUE_URL = exports.EXPIRY_MARGIN_MS = exports.AUTO_REFRESH_TICK_THRESHOLD = exports.AUTO_REFRESH_TICK_DURATION_MS = void 0;
    var version_1 = require_version4();
    exports.AUTO_REFRESH_TICK_DURATION_MS = 30 * 1e3;
    exports.AUTO_REFRESH_TICK_THRESHOLD = 3;
    exports.EXPIRY_MARGIN_MS = exports.AUTO_REFRESH_TICK_THRESHOLD * exports.AUTO_REFRESH_TICK_DURATION_MS;
    exports.GOTRUE_URL = "http://localhost:9999";
    exports.STORAGE_KEY = "supabase.auth.token";
    exports.AUDIENCE = "";
    exports.DEFAULT_HEADERS = { "X-Client-Info": `gotrue-js/${version_1.version}` };
    exports.NETWORK_FAILURE = {
      MAX_RETRIES: 10,
      RETRY_INTERVAL: 2
      // in deciseconds
    };
    exports.API_VERSION_HEADER_NAME = "X-Supabase-Api-Version";
    exports.API_VERSIONS = {
      "2024-01-01": {
        timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
        name: "2024-01-01"
      }
    };
    exports.BASE64URL_REGEX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
    exports.JWKS_TTL = 10 * 60 * 1e3;
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/errors.js
var require_errors3 = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/errors.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuthInvalidJwtError = exports.AuthWeakPasswordError = exports.AuthRetryableFetchError = exports.AuthPKCEGrantCodeExchangeError = exports.AuthImplicitGrantRedirectError = exports.AuthInvalidCredentialsError = exports.AuthInvalidTokenResponseError = exports.AuthSessionMissingError = exports.CustomAuthError = exports.AuthUnknownError = exports.AuthApiError = exports.AuthError = void 0;
    exports.isAuthError = isAuthError2;
    exports.isAuthApiError = isAuthApiError2;
    exports.isAuthSessionMissingError = isAuthSessionMissingError2;
    exports.isAuthImplicitGrantRedirectError = isAuthImplicitGrantRedirectError2;
    exports.isAuthRetryableFetchError = isAuthRetryableFetchError2;
    exports.isAuthWeakPasswordError = isAuthWeakPasswordError2;
    var AuthError2 = class extends Error {
      constructor(message, status, code) {
        super(message);
        this.__isAuthError = true;
        this.name = "AuthError";
        this.status = status;
        this.code = code;
      }
    };
    __name(AuthError2, "AuthError");
    exports.AuthError = AuthError2;
    function isAuthError2(error) {
      return typeof error === "object" && error !== null && "__isAuthError" in error;
    }
    __name(isAuthError2, "isAuthError");
    var AuthApiError2 = class extends AuthError2 {
      constructor(message, status, code) {
        super(message, status, code);
        this.name = "AuthApiError";
        this.status = status;
        this.code = code;
      }
    };
    __name(AuthApiError2, "AuthApiError");
    exports.AuthApiError = AuthApiError2;
    function isAuthApiError2(error) {
      return isAuthError2(error) && error.name === "AuthApiError";
    }
    __name(isAuthApiError2, "isAuthApiError");
    var AuthUnknownError2 = class extends AuthError2 {
      constructor(message, originalError) {
        super(message);
        this.name = "AuthUnknownError";
        this.originalError = originalError;
      }
    };
    __name(AuthUnknownError2, "AuthUnknownError");
    exports.AuthUnknownError = AuthUnknownError2;
    var CustomAuthError2 = class extends AuthError2 {
      constructor(message, name, status, code) {
        super(message, status, code);
        this.name = name;
        this.status = status;
      }
    };
    __name(CustomAuthError2, "CustomAuthError");
    exports.CustomAuthError = CustomAuthError2;
    var AuthSessionMissingError2 = class extends CustomAuthError2 {
      constructor() {
        super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
      }
    };
    __name(AuthSessionMissingError2, "AuthSessionMissingError");
    exports.AuthSessionMissingError = AuthSessionMissingError2;
    function isAuthSessionMissingError2(error) {
      return isAuthError2(error) && error.name === "AuthSessionMissingError";
    }
    __name(isAuthSessionMissingError2, "isAuthSessionMissingError");
    var AuthInvalidTokenResponseError2 = class extends CustomAuthError2 {
      constructor() {
        super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
      }
    };
    __name(AuthInvalidTokenResponseError2, "AuthInvalidTokenResponseError");
    exports.AuthInvalidTokenResponseError = AuthInvalidTokenResponseError2;
    var AuthInvalidCredentialsError2 = class extends CustomAuthError2 {
      constructor(message) {
        super(message, "AuthInvalidCredentialsError", 400, void 0);
      }
    };
    __name(AuthInvalidCredentialsError2, "AuthInvalidCredentialsError");
    exports.AuthInvalidCredentialsError = AuthInvalidCredentialsError2;
    var AuthImplicitGrantRedirectError2 = class extends CustomAuthError2 {
      constructor(message, details = null) {
        super(message, "AuthImplicitGrantRedirectError", 500, void 0);
        this.details = null;
        this.details = details;
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          details: this.details
        };
      }
    };
    __name(AuthImplicitGrantRedirectError2, "AuthImplicitGrantRedirectError");
    exports.AuthImplicitGrantRedirectError = AuthImplicitGrantRedirectError2;
    function isAuthImplicitGrantRedirectError2(error) {
      return isAuthError2(error) && error.name === "AuthImplicitGrantRedirectError";
    }
    __name(isAuthImplicitGrantRedirectError2, "isAuthImplicitGrantRedirectError");
    var AuthPKCEGrantCodeExchangeError2 = class extends CustomAuthError2 {
      constructor(message, details = null) {
        super(message, "AuthPKCEGrantCodeExchangeError", 500, void 0);
        this.details = null;
        this.details = details;
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          details: this.details
        };
      }
    };
    __name(AuthPKCEGrantCodeExchangeError2, "AuthPKCEGrantCodeExchangeError");
    exports.AuthPKCEGrantCodeExchangeError = AuthPKCEGrantCodeExchangeError2;
    var AuthRetryableFetchError2 = class extends CustomAuthError2 {
      constructor(message, status) {
        super(message, "AuthRetryableFetchError", status, void 0);
      }
    };
    __name(AuthRetryableFetchError2, "AuthRetryableFetchError");
    exports.AuthRetryableFetchError = AuthRetryableFetchError2;
    function isAuthRetryableFetchError2(error) {
      return isAuthError2(error) && error.name === "AuthRetryableFetchError";
    }
    __name(isAuthRetryableFetchError2, "isAuthRetryableFetchError");
    var AuthWeakPasswordError2 = class extends CustomAuthError2 {
      constructor(message, status, reasons) {
        super(message, "AuthWeakPasswordError", status, "weak_password");
        this.reasons = reasons;
      }
    };
    __name(AuthWeakPasswordError2, "AuthWeakPasswordError");
    exports.AuthWeakPasswordError = AuthWeakPasswordError2;
    function isAuthWeakPasswordError2(error) {
      return isAuthError2(error) && error.name === "AuthWeakPasswordError";
    }
    __name(isAuthWeakPasswordError2, "isAuthWeakPasswordError");
    var AuthInvalidJwtError2 = class extends CustomAuthError2 {
      constructor(message) {
        super(message, "AuthInvalidJwtError", 400, "invalid_jwt");
      }
    };
    __name(AuthInvalidJwtError2, "AuthInvalidJwtError");
    exports.AuthInvalidJwtError = AuthInvalidJwtError2;
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/base64url.js
var require_base64url = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/base64url.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.byteToBase64URL = byteToBase64URL;
    exports.byteFromBase64URL = byteFromBase64URL;
    exports.stringToBase64URL = stringToBase64URL;
    exports.stringFromBase64URL = stringFromBase64URL;
    exports.codepointToUTF8 = codepointToUTF8;
    exports.stringToUTF8 = stringToUTF8;
    exports.stringFromUTF8 = stringFromUTF8;
    exports.base64UrlToUint8Array = base64UrlToUint8Array;
    exports.stringToUint8Array = stringToUint8Array;
    exports.bytesToBase64URL = bytesToBase64URL;
    var TO_BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");
    var IGNORE_BASE64URL = " 	\n\r=".split("");
    var FROM_BASE64URL = (() => {
      const charMap = new Array(128);
      for (let i = 0; i < charMap.length; i += 1) {
        charMap[i] = -1;
      }
      for (let i = 0; i < IGNORE_BASE64URL.length; i += 1) {
        charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
      }
      for (let i = 0; i < TO_BASE64URL.length; i += 1) {
        charMap[TO_BASE64URL[i].charCodeAt(0)] = i;
      }
      return charMap;
    })();
    function byteToBase64URL(byte, state, emit) {
      if (byte !== null) {
        state.queue = state.queue << 8 | byte;
        state.queuedBits += 8;
        while (state.queuedBits >= 6) {
          const pos = state.queue >> state.queuedBits - 6 & 63;
          emit(TO_BASE64URL[pos]);
          state.queuedBits -= 6;
        }
      } else if (state.queuedBits > 0) {
        state.queue = state.queue << 6 - state.queuedBits;
        state.queuedBits = 6;
        while (state.queuedBits >= 6) {
          const pos = state.queue >> state.queuedBits - 6 & 63;
          emit(TO_BASE64URL[pos]);
          state.queuedBits -= 6;
        }
      }
    }
    __name(byteToBase64URL, "byteToBase64URL");
    function byteFromBase64URL(charCode, state, emit) {
      const bits = FROM_BASE64URL[charCode];
      if (bits > -1) {
        state.queue = state.queue << 6 | bits;
        state.queuedBits += 6;
        while (state.queuedBits >= 8) {
          emit(state.queue >> state.queuedBits - 8 & 255);
          state.queuedBits -= 8;
        }
      } else if (bits === -2) {
        return;
      } else {
        throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`);
      }
    }
    __name(byteFromBase64URL, "byteFromBase64URL");
    function stringToBase64URL(str) {
      const base64 = [];
      const emitter = /* @__PURE__ */ __name((char) => {
        base64.push(char);
      }, "emitter");
      const state = { queue: 0, queuedBits: 0 };
      stringToUTF8(str, (byte) => {
        byteToBase64URL(byte, state, emitter);
      });
      byteToBase64URL(null, state, emitter);
      return base64.join("");
    }
    __name(stringToBase64URL, "stringToBase64URL");
    function stringFromBase64URL(str) {
      const conv = [];
      const utf8Emit = /* @__PURE__ */ __name((codepoint) => {
        conv.push(String.fromCodePoint(codepoint));
      }, "utf8Emit");
      const utf8State = {
        utf8seq: 0,
        codepoint: 0
      };
      const b64State = { queue: 0, queuedBits: 0 };
      const byteEmit = /* @__PURE__ */ __name((byte) => {
        stringFromUTF8(byte, utf8State, utf8Emit);
      }, "byteEmit");
      for (let i = 0; i < str.length; i += 1) {
        byteFromBase64URL(str.charCodeAt(i), b64State, byteEmit);
      }
      return conv.join("");
    }
    __name(stringFromBase64URL, "stringFromBase64URL");
    function codepointToUTF8(codepoint, emit) {
      if (codepoint <= 127) {
        emit(codepoint);
        return;
      } else if (codepoint <= 2047) {
        emit(192 | codepoint >> 6);
        emit(128 | codepoint & 63);
        return;
      } else if (codepoint <= 65535) {
        emit(224 | codepoint >> 12);
        emit(128 | codepoint >> 6 & 63);
        emit(128 | codepoint & 63);
        return;
      } else if (codepoint <= 1114111) {
        emit(240 | codepoint >> 18);
        emit(128 | codepoint >> 12 & 63);
        emit(128 | codepoint >> 6 & 63);
        emit(128 | codepoint & 63);
        return;
      }
      throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
    }
    __name(codepointToUTF8, "codepointToUTF8");
    function stringToUTF8(str, emit) {
      for (let i = 0; i < str.length; i += 1) {
        let codepoint = str.charCodeAt(i);
        if (codepoint > 55295 && codepoint <= 56319) {
          const highSurrogate = (codepoint - 55296) * 1024 & 65535;
          const lowSurrogate = str.charCodeAt(i + 1) - 56320 & 65535;
          codepoint = (lowSurrogate | highSurrogate) + 65536;
          i += 1;
        }
        codepointToUTF8(codepoint, emit);
      }
    }
    __name(stringToUTF8, "stringToUTF8");
    function stringFromUTF8(byte, state, emit) {
      if (state.utf8seq === 0) {
        if (byte <= 127) {
          emit(byte);
          return;
        }
        for (let leadingBit = 1; leadingBit < 6; leadingBit += 1) {
          if ((byte >> 7 - leadingBit & 1) === 0) {
            state.utf8seq = leadingBit;
            break;
          }
        }
        if (state.utf8seq === 2) {
          state.codepoint = byte & 31;
        } else if (state.utf8seq === 3) {
          state.codepoint = byte & 15;
        } else if (state.utf8seq === 4) {
          state.codepoint = byte & 7;
        } else {
          throw new Error("Invalid UTF-8 sequence");
        }
        state.utf8seq -= 1;
      } else if (state.utf8seq > 0) {
        if (byte <= 127) {
          throw new Error("Invalid UTF-8 sequence");
        }
        state.codepoint = state.codepoint << 6 | byte & 63;
        state.utf8seq -= 1;
        if (state.utf8seq === 0) {
          emit(state.codepoint);
        }
      }
    }
    __name(stringFromUTF8, "stringFromUTF8");
    function base64UrlToUint8Array(str) {
      const result = [];
      const state = { queue: 0, queuedBits: 0 };
      const onByte = /* @__PURE__ */ __name((byte) => {
        result.push(byte);
      }, "onByte");
      for (let i = 0; i < str.length; i += 1) {
        byteFromBase64URL(str.charCodeAt(i), state, onByte);
      }
      return new Uint8Array(result);
    }
    __name(base64UrlToUint8Array, "base64UrlToUint8Array");
    function stringToUint8Array(str) {
      const result = [];
      stringToUTF8(str, (byte) => result.push(byte));
      return new Uint8Array(result);
    }
    __name(stringToUint8Array, "stringToUint8Array");
    function bytesToBase64URL(bytes) {
      const result = [];
      const state = { queue: 0, queuedBits: 0 };
      const onChar = /* @__PURE__ */ __name((char) => {
        result.push(char);
      }, "onChar");
      bytes.forEach((byte) => byteToBase64URL(byte, state, onChar));
      byteToBase64URL(null, state, onChar);
      return result.join("");
    }
    __name(bytesToBase64URL, "bytesToBase64URL");
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/helpers.js
var require_helpers4 = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/helpers.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Deferred = exports.removeItemAsync = exports.getItemAsync = exports.setItemAsync = exports.looksLikeFetchResponse = exports.resolveFetch = exports.supportsLocalStorage = exports.isBrowser = void 0;
    exports.expiresAt = expiresAt;
    exports.generateCallbackId = generateCallbackId;
    exports.parseParametersFromURL = parseParametersFromURL;
    exports.decodeJWT = decodeJWT;
    exports.sleep = sleep;
    exports.retryable = retryable;
    exports.generatePKCEVerifier = generatePKCEVerifier;
    exports.generatePKCEChallenge = generatePKCEChallenge;
    exports.getCodeChallengeAndMethod = getCodeChallengeAndMethod;
    exports.parseResponseAPIVersion = parseResponseAPIVersion;
    exports.validateExp = validateExp;
    exports.getAlgorithm = getAlgorithm;
    exports.validateUUID = validateUUID;
    exports.userNotAvailableProxy = userNotAvailableProxy;
    exports.insecureUserWarningProxy = insecureUserWarningProxy;
    exports.deepClone = deepClone;
    var constants_1 = require_constants5();
    var errors_1 = require_errors3();
    var base64url_1 = require_base64url();
    function expiresAt(expiresIn) {
      const timeNow = Math.round(Date.now() / 1e3);
      return timeNow + expiresIn;
    }
    __name(expiresAt, "expiresAt");
    function generateCallbackId() {
      return Symbol("auth-callback");
    }
    __name(generateCallbackId, "generateCallbackId");
    var isBrowser = /* @__PURE__ */ __name(() => typeof window !== "undefined" && typeof document !== "undefined", "isBrowser");
    exports.isBrowser = isBrowser;
    var localStorageWriteTests = {
      tested: false,
      writable: false
    };
    var supportsLocalStorage = /* @__PURE__ */ __name(() => {
      if (!(0, exports.isBrowser)()) {
        return false;
      }
      try {
        if (typeof globalThis.localStorage !== "object") {
          return false;
        }
      } catch (e) {
        return false;
      }
      if (localStorageWriteTests.tested) {
        return localStorageWriteTests.writable;
      }
      const randomKey = `lswt-${Math.random()}${Math.random()}`;
      try {
        globalThis.localStorage.setItem(randomKey, randomKey);
        globalThis.localStorage.removeItem(randomKey);
        localStorageWriteTests.tested = true;
        localStorageWriteTests.writable = true;
      } catch (e) {
        localStorageWriteTests.tested = true;
        localStorageWriteTests.writable = false;
      }
      return localStorageWriteTests.writable;
    }, "supportsLocalStorage");
    exports.supportsLocalStorage = supportsLocalStorage;
    function parseParametersFromURL(href) {
      const result = {};
      const url = new URL(href);
      if (url.hash && url.hash[0] === "#") {
        try {
          const hashSearchParams = new URLSearchParams(url.hash.substring(1));
          hashSearchParams.forEach((value, key) => {
            result[key] = value;
          });
        } catch (e) {
        }
      }
      url.searchParams.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }
    __name(parseParametersFromURL, "parseParametersFromURL");
    var resolveFetch = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
    exports.resolveFetch = resolveFetch;
    var looksLikeFetchResponse = /* @__PURE__ */ __name((maybeResponse) => {
      return typeof maybeResponse === "object" && maybeResponse !== null && "status" in maybeResponse && "ok" in maybeResponse && "json" in maybeResponse && typeof maybeResponse.json === "function";
    }, "looksLikeFetchResponse");
    exports.looksLikeFetchResponse = looksLikeFetchResponse;
    var setItemAsync = /* @__PURE__ */ __name(async (storage, key, data) => {
      await storage.setItem(key, JSON.stringify(data));
    }, "setItemAsync");
    exports.setItemAsync = setItemAsync;
    var getItemAsync = /* @__PURE__ */ __name(async (storage, key) => {
      const value = await storage.getItem(key);
      if (!value) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch (_a) {
        return value;
      }
    }, "getItemAsync");
    exports.getItemAsync = getItemAsync;
    var removeItemAsync = /* @__PURE__ */ __name(async (storage, key) => {
      await storage.removeItem(key);
    }, "removeItemAsync");
    exports.removeItemAsync = removeItemAsync;
    var Deferred = class {
      constructor() {
        ;
        this.promise = new Deferred.promiseConstructor((res, rej) => {
          ;
          this.resolve = res;
          this.reject = rej;
        });
      }
    };
    __name(Deferred, "Deferred");
    exports.Deferred = Deferred;
    Deferred.promiseConstructor = Promise;
    function decodeJWT(token) {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new errors_1.AuthInvalidJwtError("Invalid JWT structure");
      }
      for (let i = 0; i < parts.length; i++) {
        if (!constants_1.BASE64URL_REGEX.test(parts[i])) {
          throw new errors_1.AuthInvalidJwtError("JWT not in base64url format");
        }
      }
      const data = {
        // using base64url lib
        header: JSON.parse((0, base64url_1.stringFromBase64URL)(parts[0])),
        payload: JSON.parse((0, base64url_1.stringFromBase64URL)(parts[1])),
        signature: (0, base64url_1.base64UrlToUint8Array)(parts[2]),
        raw: {
          header: parts[0],
          payload: parts[1]
        }
      };
      return data;
    }
    __name(decodeJWT, "decodeJWT");
    async function sleep(time) {
      return await new Promise((accept) => {
        setTimeout(() => accept(null), time);
      });
    }
    __name(sleep, "sleep");
    function retryable(fn, isRetryable) {
      const promise = new Promise((accept, reject) => {
        ;
        (async () => {
          for (let attempt = 0; attempt < Infinity; attempt++) {
            try {
              const result = await fn(attempt);
              if (!isRetryable(attempt, null, result)) {
                accept(result);
                return;
              }
            } catch (e) {
              if (!isRetryable(attempt, e)) {
                reject(e);
                return;
              }
            }
          }
        })();
      });
      return promise;
    }
    __name(retryable, "retryable");
    function dec2hex(dec) {
      return ("0" + dec.toString(16)).substr(-2);
    }
    __name(dec2hex, "dec2hex");
    function generatePKCEVerifier() {
      const verifierLength = 56;
      const array = new Uint32Array(verifierLength);
      if (typeof crypto === "undefined") {
        const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
        const charSetLen = charSet.length;
        let verifier = "";
        for (let i = 0; i < verifierLength; i++) {
          verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
        }
        return verifier;
      }
      crypto.getRandomValues(array);
      return Array.from(array, dec2hex).join("");
    }
    __name(generatePKCEVerifier, "generatePKCEVerifier");
    async function sha2562(randomString) {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(randomString);
      const hash = await crypto.subtle.digest("SHA-256", encodedData);
      const bytes = new Uint8Array(hash);
      return Array.from(bytes).map((c) => String.fromCharCode(c)).join("");
    }
    __name(sha2562, "sha256");
    async function generatePKCEChallenge(verifier) {
      const hasCryptoSupport = typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined" && typeof TextEncoder !== "undefined";
      if (!hasCryptoSupport) {
        console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.");
        return verifier;
      }
      const hashed = await sha2562(verifier);
      return btoa(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    __name(generatePKCEChallenge, "generatePKCEChallenge");
    async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
      const codeVerifier = generatePKCEVerifier();
      let storedCodeVerifier = codeVerifier;
      if (isPasswordRecovery) {
        storedCodeVerifier += "/PASSWORD_RECOVERY";
      }
      await (0, exports.setItemAsync)(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
      const codeChallenge = await generatePKCEChallenge(codeVerifier);
      const codeChallengeMethod = codeVerifier === codeChallenge ? "plain" : "s256";
      return [codeChallenge, codeChallengeMethod];
    }
    __name(getCodeChallengeAndMethod, "getCodeChallengeAndMethod");
    var API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
    function parseResponseAPIVersion(response) {
      const apiVersion = response.headers.get(constants_1.API_VERSION_HEADER_NAME);
      if (!apiVersion) {
        return null;
      }
      if (!apiVersion.match(API_VERSION_REGEX)) {
        return null;
      }
      try {
        const date = /* @__PURE__ */ new Date(`${apiVersion}T00:00:00.0Z`);
        return date;
      } catch (e) {
        return null;
      }
    }
    __name(parseResponseAPIVersion, "parseResponseAPIVersion");
    function validateExp(exp) {
      if (!exp) {
        throw new Error("Missing exp claim");
      }
      const timeNow = Math.floor(Date.now() / 1e3);
      if (exp <= timeNow) {
        throw new Error("JWT has expired");
      }
    }
    __name(validateExp, "validateExp");
    function getAlgorithm(alg) {
      switch (alg) {
        case "RS256":
          return {
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" }
          };
        case "ES256":
          return {
            name: "ECDSA",
            namedCurve: "P-256",
            hash: { name: "SHA-256" }
          };
        default:
          throw new Error("Invalid alg claim");
      }
    }
    __name(getAlgorithm, "getAlgorithm");
    var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    function validateUUID(str) {
      if (!UUID_REGEX.test(str)) {
        throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not");
      }
    }
    __name(validateUUID, "validateUUID");
    function userNotAvailableProxy() {
      const proxyTarget = {};
      return new Proxy(proxyTarget, {
        get: (target, prop) => {
          if (prop === "__isUserNotAvailableProxy") {
            return true;
          }
          if (typeof prop === "symbol") {
            const sProp = prop.toString();
            if (sProp === "Symbol(Symbol.toPrimitive)" || sProp === "Symbol(Symbol.toStringTag)" || sProp === "Symbol(util.inspect.custom)") {
              return void 0;
            }
          }
          throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${prop}" property of the session object is not supported. Please use getUser() instead.`);
        },
        set: (_target, prop) => {
          throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        },
        deleteProperty: (_target, prop) => {
          throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        }
      });
    }
    __name(userNotAvailableProxy, "userNotAvailableProxy");
    function insecureUserWarningProxy(user, suppressWarningRef) {
      return new Proxy(user, {
        get: (target, prop, receiver) => {
          if (prop === "__isInsecureUserWarningProxy") {
            return true;
          }
          if (typeof prop === "symbol") {
            const sProp = prop.toString();
            if (sProp === "Symbol(Symbol.toPrimitive)" || sProp === "Symbol(Symbol.toStringTag)" || sProp === "Symbol(util.inspect.custom)" || sProp === "Symbol(nodejs.util.inspect.custom)") {
              return Reflect.get(target, prop, receiver);
            }
          }
          if (!suppressWarningRef.value && typeof prop === "string") {
            console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.");
            suppressWarningRef.value = true;
          }
          return Reflect.get(target, prop, receiver);
        }
      });
    }
    __name(insecureUserWarningProxy, "insecureUserWarningProxy");
    function deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
    __name(deepClone, "deepClone");
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/fetch.js
var require_fetch4 = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/fetch.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleError = handleError;
    exports._request = _request;
    exports._sessionResponse = _sessionResponse;
    exports._sessionResponsePassword = _sessionResponsePassword;
    exports._userResponse = _userResponse;
    exports._ssoResponse = _ssoResponse;
    exports._generateLinkResponse = _generateLinkResponse;
    exports._noResolveJsonResponse = _noResolveJsonResponse;
    var tslib_1 = require_tslib();
    var constants_1 = require_constants5();
    var helpers_1 = require_helpers4();
    var errors_1 = require_errors3();
    var _getErrorMessage = /* @__PURE__ */ __name((err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err), "_getErrorMessage");
    var NETWORK_ERROR_CODES = [502, 503, 504];
    async function handleError(error) {
      var _a;
      if (!(0, helpers_1.looksLikeFetchResponse)(error)) {
        throw new errors_1.AuthRetryableFetchError(_getErrorMessage(error), 0);
      }
      if (NETWORK_ERROR_CODES.includes(error.status)) {
        throw new errors_1.AuthRetryableFetchError(_getErrorMessage(error), error.status);
      }
      let data;
      try {
        data = await error.json();
      } catch (e) {
        throw new errors_1.AuthUnknownError(_getErrorMessage(e), e);
      }
      let errorCode = void 0;
      const responseAPIVersion = (0, helpers_1.parseResponseAPIVersion)(error);
      if (responseAPIVersion && responseAPIVersion.getTime() >= constants_1.API_VERSIONS["2024-01-01"].timestamp && typeof data === "object" && data && typeof data.code === "string") {
        errorCode = data.code;
      } else if (typeof data === "object" && data && typeof data.error_code === "string") {
        errorCode = data.error_code;
      }
      if (!errorCode) {
        if (typeof data === "object" && data && typeof data.weak_password === "object" && data.weak_password && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
          throw new errors_1.AuthWeakPasswordError(_getErrorMessage(data), error.status, data.weak_password.reasons);
        }
      } else if (errorCode === "weak_password") {
        throw new errors_1.AuthWeakPasswordError(_getErrorMessage(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
      } else if (errorCode === "session_not_found") {
        throw new errors_1.AuthSessionMissingError();
      }
      throw new errors_1.AuthApiError(_getErrorMessage(data), error.status || 500, errorCode);
    }
    __name(handleError, "handleError");
    var _getRequestParams = /* @__PURE__ */ __name((method, options, parameters, body) => {
      const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
      if (method === "GET") {
        return params;
      }
      params.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, options === null || options === void 0 ? void 0 : options.headers);
      params.body = JSON.stringify(body);
      return Object.assign(Object.assign({}, params), parameters);
    }, "_getRequestParams");
    async function _request(fetcher, method, url, options) {
      var _a;
      const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
      if (!headers[constants_1.API_VERSION_HEADER_NAME]) {
        headers[constants_1.API_VERSION_HEADER_NAME] = constants_1.API_VERSIONS["2024-01-01"].name;
      }
      if (options === null || options === void 0 ? void 0 : options.jwt) {
        headers["Authorization"] = `Bearer ${options.jwt}`;
      }
      const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
      if (options === null || options === void 0 ? void 0 : options.redirectTo) {
        qs["redirect_to"] = options.redirectTo;
      }
      const queryString = Object.keys(qs).length ? "?" + new URLSearchParams(qs).toString() : "";
      const data = await _handleRequest(fetcher, method, url + queryString, {
        headers,
        noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson
      }, {}, options === null || options === void 0 ? void 0 : options.body);
      return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
    }
    __name(_request, "_request");
    async function _handleRequest(fetcher, method, url, options, parameters, body) {
      const requestParams = _getRequestParams(method, options, parameters, body);
      let result;
      try {
        result = await fetcher(url, Object.assign({}, requestParams));
      } catch (e) {
        console.error(e);
        throw new errors_1.AuthRetryableFetchError(_getErrorMessage(e), 0);
      }
      if (!result.ok) {
        await handleError(result);
      }
      if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
        return result;
      }
      try {
        return await result.json();
      } catch (e) {
        await handleError(e);
      }
    }
    __name(_handleRequest, "_handleRequest");
    function _sessionResponse(data) {
      var _a;
      let session = null;
      if (hasSession(data)) {
        session = Object.assign({}, data);
        if (!data.expires_at) {
          session.expires_at = (0, helpers_1.expiresAt)(data.expires_in);
        }
      }
      const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
      return { data: { session, user }, error: null };
    }
    __name(_sessionResponse, "_sessionResponse");
    function _sessionResponsePassword(data) {
      const response = _sessionResponse(data);
      if (!response.error && data.weak_password && typeof data.weak_password === "object" && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.message && typeof data.weak_password.message === "string" && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
        response.data.weak_password = data.weak_password;
      }
      return response;
    }
    __name(_sessionResponsePassword, "_sessionResponsePassword");
    function _userResponse(data) {
      var _a;
      const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
      return { data: { user }, error: null };
    }
    __name(_userResponse, "_userResponse");
    function _ssoResponse(data) {
      return { data, error: null };
    }
    __name(_ssoResponse, "_ssoResponse");
    function _generateLinkResponse(data) {
      const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = tslib_1.__rest(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
      const properties = {
        action_link,
        email_otp,
        hashed_token,
        redirect_to,
        verification_type
      };
      const user = Object.assign({}, rest);
      return {
        data: {
          properties,
          user
        },
        error: null
      };
    }
    __name(_generateLinkResponse, "_generateLinkResponse");
    function _noResolveJsonResponse(data) {
      return data;
    }
    __name(_noResolveJsonResponse, "_noResolveJsonResponse");
    function hasSession(data) {
      return data.access_token && data.refresh_token && data.expires_in;
    }
    __name(hasSession, "hasSession");
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/types.js
var require_types3 = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/types.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SIGN_OUT_SCOPES = void 0;
    exports.SIGN_OUT_SCOPES = ["global", "local", "others"];
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/GoTrueAdminApi.js
var require_GoTrueAdminApi = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/GoTrueAdminApi.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var fetch_1 = require_fetch4();
    var helpers_1 = require_helpers4();
    var types_1 = require_types3();
    var errors_1 = require_errors3();
    var GoTrueAdminApi2 = class {
      /**
       * Creates an admin API client that can be used to manage users and OAuth clients.
       *
       * @example
       * ```ts
       * import { GoTrueAdminApi } from '@supabase/auth-js'
       *
       * const admin = new GoTrueAdminApi({
       *   url: 'https://xyzcompany.supabase.co/auth/v1',
       *   headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
       * })
       * ```
       */
      constructor({ url = "", headers = {}, fetch: fetch2 }) {
        this.url = url;
        this.headers = headers;
        this.fetch = (0, helpers_1.resolveFetch)(fetch2);
        this.mfa = {
          listFactors: this._listFactors.bind(this),
          deleteFactor: this._deleteFactor.bind(this)
        };
        this.oauth = {
          listClients: this._listOAuthClients.bind(this),
          createClient: this._createOAuthClient.bind(this),
          getClient: this._getOAuthClient.bind(this),
          updateClient: this._updateOAuthClient.bind(this),
          deleteClient: this._deleteOAuthClient.bind(this),
          regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this)
        };
      }
      /**
       * Removes a logged-in session.
       * @param jwt A valid, logged-in JWT.
       * @param scope The logout sope.
       */
      async signOut(jwt, scope = types_1.SIGN_OUT_SCOPES[0]) {
        if (types_1.SIGN_OUT_SCOPES.indexOf(scope) < 0) {
          throw new Error(`@supabase/auth-js: Parameter scope must be one of ${types_1.SIGN_OUT_SCOPES.join(", ")}`);
        }
        try {
          await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/logout?scope=${scope}`, {
            headers: this.headers,
            jwt,
            noResolveJson: true
          });
          return { data: null, error: null };
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Sends an invite link to an email address.
       * @param email The email address of the user.
       * @param options Additional options to be included when inviting.
       */
      async inviteUserByEmail(email, options = {}) {
        try {
          return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/invite`, {
            body: { email, data: options.data },
            headers: this.headers,
            redirectTo: options.redirectTo,
            xform: fetch_1._userResponse
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      /**
       * Generates email links and OTPs to be sent via a custom email provider.
       * @param email The user's email.
       * @param options.password User password. For signup only.
       * @param options.data Optional user metadata. For signup only.
       * @param options.redirectTo The redirect url which should be appended to the generated link
       */
      async generateLink(params) {
        try {
          const { options } = params, rest = tslib_1.__rest(params, ["options"]);
          const body = Object.assign(Object.assign({}, rest), options);
          if ("newEmail" in rest) {
            body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
            delete body["newEmail"];
          }
          return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/admin/generate_link`, {
            body,
            headers: this.headers,
            xform: fetch_1._generateLinkResponse,
            redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return {
              data: {
                properties: null,
                user: null
              },
              error
            };
          }
          throw error;
        }
      }
      // User Admin API
      /**
       * Creates a new user.
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async createUser(attributes) {
        try {
          return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/admin/users`, {
            body: attributes,
            headers: this.headers,
            xform: fetch_1._userResponse
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      /**
       * Get a list of users.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
       */
      async listUsers(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
          const pagination = { nextPage: null, lastPage: 0, total: 0 };
          const response = await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/admin/users`, {
            headers: this.headers,
            noResolveJson: true,
            query: {
              page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
              per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
            },
            xform: fetch_1._noResolveJsonResponse
          });
          if (response.error)
            throw response.error;
          const users = await response.json();
          const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
          const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
          if (links.length > 0) {
            links.forEach((link) => {
              const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
              const rel = JSON.parse(link.split(";")[1].split("=")[1]);
              pagination[`${rel}Page`] = page;
            });
            pagination.total = parseInt(total);
          }
          return { data: Object.assign(Object.assign({}, users), pagination), error: null };
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { users: [] }, error };
          }
          throw error;
        }
      }
      /**
       * Get user by id.
       *
       * @param uid The user's unique identifier
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async getUserById(uid) {
        (0, helpers_1.validateUUID)(uid);
        try {
          return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/admin/users/${uid}`, {
            headers: this.headers,
            xform: fetch_1._userResponse
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      /**
       * Updates the user data.
       *
       * @param attributes The data you want to update.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async updateUserById(uid, attributes) {
        (0, helpers_1.validateUUID)(uid);
        try {
          return await (0, fetch_1._request)(this.fetch, "PUT", `${this.url}/admin/users/${uid}`, {
            body: attributes,
            headers: this.headers,
            xform: fetch_1._userResponse
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      /**
       * Delete a user. Requires a `service_role` key.
       *
       * @param id The user id you want to remove.
       * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
       * Defaults to false for backward compatibility.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async deleteUser(id, shouldSoftDelete = false) {
        (0, helpers_1.validateUUID)(id);
        try {
          return await (0, fetch_1._request)(this.fetch, "DELETE", `${this.url}/admin/users/${id}`, {
            headers: this.headers,
            body: {
              should_soft_delete: shouldSoftDelete
            },
            xform: fetch_1._userResponse
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      async _listFactors(params) {
        (0, helpers_1.validateUUID)(params.userId);
        try {
          const { data, error } = await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/admin/users/${params.userId}/factors`, {
            headers: this.headers,
            xform: (factors) => {
              return { data: { factors }, error: null };
            }
          });
          return { data, error };
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      async _deleteFactor(params) {
        (0, helpers_1.validateUUID)(params.userId);
        (0, helpers_1.validateUUID)(params.id);
        try {
          const data = await (0, fetch_1._request)(this.fetch, "DELETE", `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
            headers: this.headers
          });
          return { data, error: null };
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Lists all OAuth clients with optional pagination.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _listOAuthClients(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
          const pagination = { nextPage: null, lastPage: 0, total: 0 };
          const response = await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/admin/oauth/clients`, {
            headers: this.headers,
            noResolveJson: true,
            query: {
              page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
              per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
            },
            xform: fetch_1._noResolveJsonResponse
          });
          if (response.error)
            throw response.error;
          const clients = await response.json();
          const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
          const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
          if (links.length > 0) {
            links.forEach((link) => {
              const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
              const rel = JSON.parse(link.split(";")[1].split("=")[1]);
              pagination[`${rel}Page`] = page;
            });
            pagination.total = parseInt(total);
          }
          return { data: Object.assign(Object.assign({}, clients), pagination), error: null };
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { clients: [] }, error };
          }
          throw error;
        }
      }
      /**
       * Creates a new OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _createOAuthClient(params) {
        try {
          return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/admin/oauth/clients`, {
            body: params,
            headers: this.headers,
            xform: (client) => {
              return { data: client, error: null };
            }
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Gets details of a specific OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _getOAuthClient(clientId) {
        try {
          return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/admin/oauth/clients/${clientId}`, {
            headers: this.headers,
            xform: (client) => {
              return { data: client, error: null };
            }
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Updates an existing OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _updateOAuthClient(clientId, params) {
        try {
          return await (0, fetch_1._request)(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${clientId}`, {
            body: params,
            headers: this.headers,
            xform: (client) => {
              return { data: client, error: null };
            }
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Deletes an OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _deleteOAuthClient(clientId) {
        try {
          await (0, fetch_1._request)(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${clientId}`, {
            headers: this.headers,
            noResolveJson: true
          });
          return { data: null, error: null };
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Regenerates the secret for an OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _regenerateOAuthClientSecret(clientId) {
        try {
          return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/admin/oauth/clients/${clientId}/regenerate_secret`, {
            headers: this.headers,
            xform: (client) => {
              return { data: client, error: null };
            }
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
    };
    __name(GoTrueAdminApi2, "GoTrueAdminApi");
    exports.default = GoTrueAdminApi2;
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/local-storage.js
var require_local_storage = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/local-storage.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.memoryLocalStorageAdapter = memoryLocalStorageAdapter;
    function memoryLocalStorageAdapter(store = {}) {
      return {
        getItem: (key) => {
          return store[key] || null;
        },
        setItem: (key, value) => {
          store[key] = value;
        },
        removeItem: (key) => {
          delete store[key];
        }
      };
    }
    __name(memoryLocalStorageAdapter, "memoryLocalStorageAdapter");
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/locks.js
var require_locks = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/locks.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProcessLockAcquireTimeoutError = exports.NavigatorLockAcquireTimeoutError = exports.LockAcquireTimeoutError = exports.internals = void 0;
    exports.navigatorLock = navigatorLock2;
    exports.processLock = processLock2;
    var helpers_1 = require_helpers4();
    exports.internals = {
      /**
       * @experimental
       */
      debug: !!(globalThis && (0, helpers_1.supportsLocalStorage)() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
    };
    var LockAcquireTimeoutError = class extends Error {
      constructor(message) {
        super(message);
        this.isAcquireTimeout = true;
      }
    };
    __name(LockAcquireTimeoutError, "LockAcquireTimeoutError");
    exports.LockAcquireTimeoutError = LockAcquireTimeoutError;
    var NavigatorLockAcquireTimeoutError2 = class extends LockAcquireTimeoutError {
    };
    __name(NavigatorLockAcquireTimeoutError2, "NavigatorLockAcquireTimeoutError");
    exports.NavigatorLockAcquireTimeoutError = NavigatorLockAcquireTimeoutError2;
    var ProcessLockAcquireTimeoutError = class extends LockAcquireTimeoutError {
    };
    __name(ProcessLockAcquireTimeoutError, "ProcessLockAcquireTimeoutError");
    exports.ProcessLockAcquireTimeoutError = ProcessLockAcquireTimeoutError;
    async function navigatorLock2(name, acquireTimeout, fn) {
      if (exports.internals.debug) {
        console.log("@supabase/gotrue-js: navigatorLock: acquire lock", name, acquireTimeout);
      }
      const abortController = new globalThis.AbortController();
      if (acquireTimeout > 0) {
        setTimeout(() => {
          abortController.abort();
          if (exports.internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock acquire timed out", name);
          }
        }, acquireTimeout);
      }
      return await Promise.resolve().then(() => globalThis.navigator.locks.request(name, acquireTimeout === 0 ? {
        mode: "exclusive",
        ifAvailable: true
      } : {
        mode: "exclusive",
        signal: abortController.signal
      }, async (lock) => {
        if (lock) {
          if (exports.internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock: acquired", name, lock.name);
          }
          try {
            return await fn();
          } finally {
            if (exports.internals.debug) {
              console.log("@supabase/gotrue-js: navigatorLock: released", name, lock.name);
            }
          }
        } else {
          if (acquireTimeout === 0) {
            if (exports.internals.debug) {
              console.log("@supabase/gotrue-js: navigatorLock: not immediately available", name);
            }
            throw new NavigatorLockAcquireTimeoutError2(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
          } else {
            if (exports.internals.debug) {
              try {
                const result = await globalThis.navigator.locks.query();
                console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(result, null, "  "));
              } catch (e) {
                console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", e);
              }
            }
            console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request");
            return await fn();
          }
        }
      }));
    }
    __name(navigatorLock2, "navigatorLock");
    var PROCESS_LOCKS = {};
    async function processLock2(name, acquireTimeout, fn) {
      var _a;
      const previousOperation = (_a = PROCESS_LOCKS[name]) !== null && _a !== void 0 ? _a : Promise.resolve();
      const currentOperation = Promise.race([
        previousOperation.catch(() => {
          return null;
        }),
        acquireTimeout >= 0 ? new Promise((_, reject) => {
          setTimeout(() => {
            reject(new ProcessLockAcquireTimeoutError(`Acquring process lock with name "${name}" timed out`));
          }, acquireTimeout);
        }) : null
      ].filter((x) => x)).catch((e) => {
        if (e && e.isAcquireTimeout) {
          throw e;
        }
        return null;
      }).then(async () => {
        return await fn();
      });
      PROCESS_LOCKS[name] = currentOperation.catch(async (e) => {
        if (e && e.isAcquireTimeout) {
          await previousOperation;
          return null;
        }
        throw e;
      });
      return await currentOperation;
    }
    __name(processLock2, "processLock");
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/polyfills.js
var require_polyfills = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/polyfills.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.polyfillGlobalThis = polyfillGlobalThis;
    function polyfillGlobalThis() {
      if (typeof globalThis === "object")
        return;
      try {
        Object.defineProperty(Object.prototype, "__magic__", {
          get: function() {
            return this;
          },
          configurable: true
        });
        __magic__.globalThis = __magic__;
        delete Object.prototype.__magic__;
      } catch (e) {
        if (typeof self !== "undefined") {
          self.globalThis = self;
        }
      }
    }
    __name(polyfillGlobalThis, "polyfillGlobalThis");
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/web3/ethereum.js
var require_ethereum = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/web3/ethereum.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAddress = getAddress;
    exports.fromHex = fromHex;
    exports.toHex = toHex;
    exports.createSiweMessage = createSiweMessage;
    function getAddress(address) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error(`@supabase/auth-js: Address "${address}" is invalid.`);
      }
      return address.toLowerCase();
    }
    __name(getAddress, "getAddress");
    function fromHex(hex) {
      return parseInt(hex, 16);
    }
    __name(fromHex, "fromHex");
    function toHex(value) {
      const bytes = new TextEncoder().encode(value);
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      return "0x" + hex;
    }
    __name(toHex, "toHex");
    function createSiweMessage(parameters) {
      var _a;
      const { chainId, domain, expirationTime, issuedAt = /* @__PURE__ */ new Date(), nonce, notBefore, requestId, resources, scheme, uri, version } = parameters;
      {
        if (!Number.isInteger(chainId))
          throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${chainId}`);
        if (!domain)
          throw new Error(`@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.`);
        if (nonce && nonce.length < 8)
          throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${nonce}`);
        if (!uri)
          throw new Error(`@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.`);
        if (version !== "1")
          throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${version}`);
        if ((_a = parameters.statement) === null || _a === void 0 ? void 0 : _a.includes("\n"))
          throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${parameters.statement}`);
      }
      const address = getAddress(parameters.address);
      const origin = scheme ? `${scheme}://${domain}` : domain;
      const statement = parameters.statement ? `${parameters.statement}
` : "";
      const prefix = `${origin} wants you to sign in with your Ethereum account:
${address}

${statement}`;
      let suffix = `URI: ${uri}
Version: ${version}
Chain ID: ${chainId}${nonce ? `
Nonce: ${nonce}` : ""}
Issued At: ${issuedAt.toISOString()}`;
      if (expirationTime)
        suffix += `
Expiration Time: ${expirationTime.toISOString()}`;
      if (notBefore)
        suffix += `
Not Before: ${notBefore.toISOString()}`;
      if (requestId)
        suffix += `
Request ID: ${requestId}`;
      if (resources) {
        let content = "\nResources:";
        for (const resource of resources) {
          if (!resource || typeof resource !== "string")
            throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${resource}`);
          content += `
- ${resource}`;
        }
        suffix += content;
      }
      return `${prefix}
${suffix}`;
    }
    __name(createSiweMessage, "createSiweMessage");
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/webauthn.errors.js
var require_webauthn_errors = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/webauthn.errors.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebAuthnUnknownError = exports.WebAuthnError = void 0;
    exports.isWebAuthnError = isWebAuthnError;
    exports.identifyRegistrationError = identifyRegistrationError;
    exports.identifyAuthenticationError = identifyAuthenticationError;
    var webauthn_1 = require_webauthn();
    var WebAuthnError = class extends Error {
      constructor({ message, code, cause, name }) {
        var _a;
        super(message, { cause });
        this.__isWebAuthnError = true;
        this.name = (_a = name !== null && name !== void 0 ? name : cause instanceof Error ? cause.name : void 0) !== null && _a !== void 0 ? _a : "Unknown Error";
        this.code = code;
      }
    };
    __name(WebAuthnError, "WebAuthnError");
    exports.WebAuthnError = WebAuthnError;
    var WebAuthnUnknownError = class extends WebAuthnError {
      constructor(message, originalError) {
        super({
          code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
          cause: originalError,
          message
        });
        this.name = "WebAuthnUnknownError";
        this.originalError = originalError;
      }
    };
    __name(WebAuthnUnknownError, "WebAuthnUnknownError");
    exports.WebAuthnUnknownError = WebAuthnUnknownError;
    function isWebAuthnError(error) {
      return typeof error === "object" && error !== null && "__isWebAuthnError" in error;
    }
    __name(isWebAuthnError, "isWebAuthnError");
    function identifyRegistrationError({ error, options }) {
      var _a, _b, _c;
      const { publicKey } = options;
      if (!publicKey) {
        throw Error("options was missing required publicKey property");
      }
      if (error.name === "AbortError") {
        if (options.signal instanceof AbortSignal) {
          return new WebAuthnError({
            message: "Registration ceremony was sent an abort signal",
            code: "ERROR_CEREMONY_ABORTED",
            cause: error
          });
        }
      } else if (error.name === "ConstraintError") {
        if (((_a = publicKey.authenticatorSelection) === null || _a === void 0 ? void 0 : _a.requireResidentKey) === true) {
          return new WebAuthnError({
            message: "Discoverable credentials were required but no available authenticator supported it",
            code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
            cause: error
          });
        } else if (
          // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
          options.mediation === "conditional" && ((_b = publicKey.authenticatorSelection) === null || _b === void 0 ? void 0 : _b.userVerification) === "required"
        ) {
          return new WebAuthnError({
            message: "User verification was required during automatic registration but it could not be performed",
            code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
            cause: error
          });
        } else if (((_c = publicKey.authenticatorSelection) === null || _c === void 0 ? void 0 : _c.userVerification) === "required") {
          return new WebAuthnError({
            message: "User verification was required but no available authenticator supported it",
            code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
            cause: error
          });
        }
      } else if (error.name === "InvalidStateError") {
        return new WebAuthnError({
          message: "The authenticator was previously registered",
          code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
          cause: error
        });
      } else if (error.name === "NotAllowedError") {
        return new WebAuthnError({
          message: error.message,
          code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
          cause: error
        });
      } else if (error.name === "NotSupportedError") {
        const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param) => param.type === "public-key");
        if (validPubKeyCredParams.length === 0) {
          return new WebAuthnError({
            message: 'No entry in pubKeyCredParams was of type "public-key"',
            code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
            cause: error
          });
        }
        return new WebAuthnError({
          message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
          code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
          cause: error
        });
      } else if (error.name === "SecurityError") {
        const effectiveDomain = window.location.hostname;
        if (!(0, webauthn_1.isValidDomain)(effectiveDomain)) {
          return new WebAuthnError({
            message: `${window.location.hostname} is an invalid domain`,
            code: "ERROR_INVALID_DOMAIN",
            cause: error
          });
        } else if (publicKey.rp.id !== effectiveDomain) {
          return new WebAuthnError({
            message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: error
          });
        }
      } else if (error.name === "TypeError") {
        if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
          return new WebAuthnError({
            message: "User ID was not between 1 and 64 characters",
            code: "ERROR_INVALID_USER_ID_LENGTH",
            cause: error
          });
        }
      } else if (error.name === "UnknownError") {
        return new WebAuthnError({
          message: "The authenticator was unable to process the specified options, or could not create a new credential",
          code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
          cause: error
        });
      }
      return new WebAuthnError({
        message: "a Non-Webauthn related error has occurred",
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: error
      });
    }
    __name(identifyRegistrationError, "identifyRegistrationError");
    function identifyAuthenticationError({ error, options }) {
      const { publicKey } = options;
      if (!publicKey) {
        throw Error("options was missing required publicKey property");
      }
      if (error.name === "AbortError") {
        if (options.signal instanceof AbortSignal) {
          return new WebAuthnError({
            message: "Authentication ceremony was sent an abort signal",
            code: "ERROR_CEREMONY_ABORTED",
            cause: error
          });
        }
      } else if (error.name === "NotAllowedError") {
        return new WebAuthnError({
          message: error.message,
          code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
          cause: error
        });
      } else if (error.name === "SecurityError") {
        const effectiveDomain = window.location.hostname;
        if (!(0, webauthn_1.isValidDomain)(effectiveDomain)) {
          return new WebAuthnError({
            message: `${window.location.hostname} is an invalid domain`,
            code: "ERROR_INVALID_DOMAIN",
            cause: error
          });
        } else if (publicKey.rpId !== effectiveDomain) {
          return new WebAuthnError({
            message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: error
          });
        }
      } else if (error.name === "UnknownError") {
        return new WebAuthnError({
          message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
          code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
          cause: error
        });
      }
      return new WebAuthnError({
        message: "a Non-Webauthn related error has occurred",
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: error
      });
    }
    __name(identifyAuthenticationError, "identifyAuthenticationError");
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/webauthn.js
var require_webauthn = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/lib/webauthn.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebAuthnApi = exports.DEFAULT_REQUEST_OPTIONS = exports.DEFAULT_CREATION_OPTIONS = exports.webAuthnAbortService = exports.WebAuthnAbortService = exports.identifyAuthenticationError = exports.identifyRegistrationError = exports.isWebAuthnError = exports.WebAuthnError = void 0;
    exports.deserializeCredentialCreationOptions = deserializeCredentialCreationOptions;
    exports.deserializeCredentialRequestOptions = deserializeCredentialRequestOptions;
    exports.serializeCredentialCreationResponse = serializeCredentialCreationResponse;
    exports.serializeCredentialRequestResponse = serializeCredentialRequestResponse;
    exports.isValidDomain = isValidDomain;
    exports.createCredential = createCredential;
    exports.getCredential = getCredential;
    exports.mergeCredentialCreationOptions = mergeCredentialCreationOptions;
    exports.mergeCredentialRequestOptions = mergeCredentialRequestOptions;
    var tslib_1 = require_tslib();
    var base64url_1 = require_base64url();
    var errors_1 = require_errors3();
    var helpers_1 = require_helpers4();
    var webauthn_errors_1 = require_webauthn_errors();
    Object.defineProperty(exports, "identifyAuthenticationError", { enumerable: true, get: function() {
      return webauthn_errors_1.identifyAuthenticationError;
    } });
    Object.defineProperty(exports, "identifyRegistrationError", { enumerable: true, get: function() {
      return webauthn_errors_1.identifyRegistrationError;
    } });
    Object.defineProperty(exports, "isWebAuthnError", { enumerable: true, get: function() {
      return webauthn_errors_1.isWebAuthnError;
    } });
    Object.defineProperty(exports, "WebAuthnError", { enumerable: true, get: function() {
      return webauthn_errors_1.WebAuthnError;
    } });
    var WebAuthnAbortService = class {
      /**
       * Create an abort signal for a new WebAuthn operation.
       * Automatically cancels any existing operation.
       *
       * @returns {AbortSignal} Signal to pass to navigator.credentials.create() or .get()
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal MDN - AbortSignal}
       */
      createNewAbortSignal() {
        if (this.controller) {
          const abortError = new Error("Cancelling existing WebAuthn API call for new one");
          abortError.name = "AbortError";
          this.controller.abort(abortError);
        }
        const newController = new AbortController();
        this.controller = newController;
        return newController.signal;
      }
      /**
       * Manually cancel the current WebAuthn operation.
       * Useful for cleaning up when user cancels or navigates away.
       *
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort MDN - AbortController.abort}
       */
      cancelCeremony() {
        if (this.controller) {
          const abortError = new Error("Manually cancelling existing WebAuthn API call");
          abortError.name = "AbortError";
          this.controller.abort(abortError);
          this.controller = void 0;
        }
      }
    };
    __name(WebAuthnAbortService, "WebAuthnAbortService");
    exports.WebAuthnAbortService = WebAuthnAbortService;
    exports.webAuthnAbortService = new WebAuthnAbortService();
    function deserializeCredentialCreationOptions(options) {
      if (!options) {
        throw new Error("Credential creation options are required");
      }
      if (typeof PublicKeyCredential !== "undefined" && "parseCreationOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseCreationOptionsFromJSON === "function") {
        return PublicKeyCredential.parseCreationOptionsFromJSON(
          /** we assert the options here as typescript still doesn't know about future webauthn types */
          options
        );
      }
      const { challenge: challengeStr, user: userOpts, excludeCredentials } = options, restOptions = tslib_1.__rest(
        options,
        ["challenge", "user", "excludeCredentials"]
      );
      const challenge = (0, base64url_1.base64UrlToUint8Array)(challengeStr).buffer;
      const user = Object.assign(Object.assign({}, userOpts), { id: (0, base64url_1.base64UrlToUint8Array)(userOpts.id).buffer });
      const result = Object.assign(Object.assign({}, restOptions), {
        challenge,
        user
      });
      if (excludeCredentials && excludeCredentials.length > 0) {
        result.excludeCredentials = new Array(excludeCredentials.length);
        for (let i = 0; i < excludeCredentials.length; i++) {
          const cred = excludeCredentials[i];
          result.excludeCredentials[i] = Object.assign(Object.assign({}, cred), {
            id: (0, base64url_1.base64UrlToUint8Array)(cred.id).buffer,
            type: cred.type || "public-key",
            // Cast transports to handle future transport types like "cable"
            transports: cred.transports
          });
        }
      }
      return result;
    }
    __name(deserializeCredentialCreationOptions, "deserializeCredentialCreationOptions");
    function deserializeCredentialRequestOptions(options) {
      if (!options) {
        throw new Error("Credential request options are required");
      }
      if (typeof PublicKeyCredential !== "undefined" && "parseRequestOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseRequestOptionsFromJSON === "function") {
        return PublicKeyCredential.parseRequestOptionsFromJSON(options);
      }
      const { challenge: challengeStr, allowCredentials } = options, restOptions = tslib_1.__rest(
        options,
        ["challenge", "allowCredentials"]
      );
      const challenge = (0, base64url_1.base64UrlToUint8Array)(challengeStr).buffer;
      const result = Object.assign(Object.assign({}, restOptions), { challenge });
      if (allowCredentials && allowCredentials.length > 0) {
        result.allowCredentials = new Array(allowCredentials.length);
        for (let i = 0; i < allowCredentials.length; i++) {
          const cred = allowCredentials[i];
          result.allowCredentials[i] = Object.assign(Object.assign({}, cred), {
            id: (0, base64url_1.base64UrlToUint8Array)(cred.id).buffer,
            type: cred.type || "public-key",
            // Cast transports to handle future transport types like "cable"
            transports: cred.transports
          });
        }
      }
      return result;
    }
    __name(deserializeCredentialRequestOptions, "deserializeCredentialRequestOptions");
    function serializeCredentialCreationResponse(credential) {
      var _a;
      if ("toJSON" in credential && typeof credential.toJSON === "function") {
        return credential.toJSON();
      }
      const credentialWithAttachment = credential;
      return {
        id: credential.id,
        rawId: credential.id,
        response: {
          attestationObject: (0, base64url_1.bytesToBase64URL)(new Uint8Array(credential.response.attestationObject)),
          clientDataJSON: (0, base64url_1.bytesToBase64URL)(new Uint8Array(credential.response.clientDataJSON))
        },
        type: "public-key",
        clientExtensionResults: credential.getClientExtensionResults(),
        // Convert null to undefined and cast to AuthenticatorAttachment type
        authenticatorAttachment: (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : void 0
      };
    }
    __name(serializeCredentialCreationResponse, "serializeCredentialCreationResponse");
    function serializeCredentialRequestResponse(credential) {
      var _a;
      if ("toJSON" in credential && typeof credential.toJSON === "function") {
        return credential.toJSON();
      }
      const credentialWithAttachment = credential;
      const clientExtensionResults = credential.getClientExtensionResults();
      const assertionResponse = credential.response;
      return {
        id: credential.id,
        rawId: credential.id,
        // W3C spec expects rawId to match id for JSON format
        response: {
          authenticatorData: (0, base64url_1.bytesToBase64URL)(new Uint8Array(assertionResponse.authenticatorData)),
          clientDataJSON: (0, base64url_1.bytesToBase64URL)(new Uint8Array(assertionResponse.clientDataJSON)),
          signature: (0, base64url_1.bytesToBase64URL)(new Uint8Array(assertionResponse.signature)),
          userHandle: assertionResponse.userHandle ? (0, base64url_1.bytesToBase64URL)(new Uint8Array(assertionResponse.userHandle)) : void 0
        },
        type: "public-key",
        clientExtensionResults,
        // Convert null to undefined and cast to AuthenticatorAttachment type
        authenticatorAttachment: (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : void 0
      };
    }
    __name(serializeCredentialRequestResponse, "serializeCredentialRequestResponse");
    function isValidDomain(hostname) {
      return (
        // Consider localhost valid as well since it's okay wrt Secure Contexts
        hostname === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname)
      );
    }
    __name(isValidDomain, "isValidDomain");
    function browserSupportsWebAuthn() {
      var _a, _b;
      return !!((0, helpers_1.isBrowser)() && "PublicKeyCredential" in window && window.PublicKeyCredential && "credentials" in navigator && typeof ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _a === void 0 ? void 0 : _a.create) === "function" && typeof ((_b = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _b === void 0 ? void 0 : _b.get) === "function");
    }
    __name(browserSupportsWebAuthn, "browserSupportsWebAuthn");
    async function createCredential(options) {
      try {
        const response = await navigator.credentials.create(
          /** we assert the type here until typescript types are updated */
          options
        );
        if (!response) {
          return {
            data: null,
            error: new webauthn_errors_1.WebAuthnUnknownError("Empty credential response", response)
          };
        }
        if (!(response instanceof PublicKeyCredential)) {
          return {
            data: null,
            error: new webauthn_errors_1.WebAuthnUnknownError("Browser returned unexpected credential type", response)
          };
        }
        return { data: response, error: null };
      } catch (err) {
        return {
          data: null,
          error: (0, webauthn_errors_1.identifyRegistrationError)({
            error: err,
            options
          })
        };
      }
    }
    __name(createCredential, "createCredential");
    async function getCredential(options) {
      try {
        const response = await navigator.credentials.get(
          /** we assert the type here until typescript types are updated */
          options
        );
        if (!response) {
          return {
            data: null,
            error: new webauthn_errors_1.WebAuthnUnknownError("Empty credential response", response)
          };
        }
        if (!(response instanceof PublicKeyCredential)) {
          return {
            data: null,
            error: new webauthn_errors_1.WebAuthnUnknownError("Browser returned unexpected credential type", response)
          };
        }
        return { data: response, error: null };
      } catch (err) {
        return {
          data: null,
          error: (0, webauthn_errors_1.identifyAuthenticationError)({
            error: err,
            options
          })
        };
      }
    }
    __name(getCredential, "getCredential");
    exports.DEFAULT_CREATION_OPTIONS = {
      hints: ["security-key"],
      authenticatorSelection: {
        authenticatorAttachment: "cross-platform",
        requireResidentKey: false,
        /** set to preferred because older yubikeys don't have PIN/Biometric */
        userVerification: "preferred",
        residentKey: "discouraged"
      },
      attestation: "direct"
    };
    exports.DEFAULT_REQUEST_OPTIONS = {
      /** set to preferred because older yubikeys don't have PIN/Biometric */
      userVerification: "preferred",
      hints: ["security-key"],
      attestation: "direct"
    };
    function deepMerge(...sources) {
      const isObject = /* @__PURE__ */ __name((val) => val !== null && typeof val === "object" && !Array.isArray(val), "isObject");
      const isArrayBufferLike = /* @__PURE__ */ __name((val) => val instanceof ArrayBuffer || ArrayBuffer.isView(val), "isArrayBufferLike");
      const result = {};
      for (const source of sources) {
        if (!source)
          continue;
        for (const key in source) {
          const value = source[key];
          if (value === void 0)
            continue;
          if (Array.isArray(value)) {
            result[key] = value;
          } else if (isArrayBufferLike(value)) {
            result[key] = value;
          } else if (isObject(value)) {
            const existing = result[key];
            if (isObject(existing)) {
              result[key] = deepMerge(existing, value);
            } else {
              result[key] = deepMerge(value);
            }
          } else {
            result[key] = value;
          }
        }
      }
      return result;
    }
    __name(deepMerge, "deepMerge");
    function mergeCredentialCreationOptions(baseOptions, overrides) {
      return deepMerge(exports.DEFAULT_CREATION_OPTIONS, baseOptions, overrides || {});
    }
    __name(mergeCredentialCreationOptions, "mergeCredentialCreationOptions");
    function mergeCredentialRequestOptions(baseOptions, overrides) {
      return deepMerge(exports.DEFAULT_REQUEST_OPTIONS, baseOptions, overrides || {});
    }
    __name(mergeCredentialRequestOptions, "mergeCredentialRequestOptions");
    var WebAuthnApi = class {
      constructor(client) {
        this.client = client;
        this.enroll = this._enroll.bind(this);
        this.challenge = this._challenge.bind(this);
        this.verify = this._verify.bind(this);
        this.authenticate = this._authenticate.bind(this);
        this.register = this._register.bind(this);
      }
      /**
       * Enroll a new WebAuthn factor.
       * Creates an unverified WebAuthn factor that must be verified with a credential.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Omit<MFAEnrollWebauthnParams, 'factorType'>} params - Enrollment parameters (friendlyName required)
       * @returns {Promise<AuthMFAEnrollWebauthnResponse>} Enrolled factor details or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registering a New Credential}
       */
      async _enroll(params) {
        return this.client.mfa.enroll(Object.assign(Object.assign({}, params), { factorType: "webauthn" }));
      }
      /**
       * Challenge for WebAuthn credential creation or authentication.
       * Combines server challenge with browser credential operations.
       * Handles both registration (create) and authentication (request) flows.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {MFAChallengeWebauthnParams & { friendlyName?: string; signal?: AbortSignal }} params - Challenge parameters including factorId
       * @param {Object} overrides - Allows you to override the parameters passed to navigator.credentials
       * @param {PublicKeyCredentialCreationOptionsFuture} overrides.create - Override options for credential creation
       * @param {PublicKeyCredentialRequestOptionsFuture} overrides.request - Override options for credential request
       * @returns {Promise<RequestResult>} Challenge response with credential or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-credential-creation W3C WebAuthn Spec - Credential Creation}
       * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying Assertion}
       */
      async _challenge({ factorId, webauthn, friendlyName, signal }, overrides) {
        try {
          const { data: challengeResponse, error: challengeError } = await this.client.mfa.challenge({
            factorId,
            webauthn
          });
          if (!challengeResponse) {
            return { data: null, error: challengeError };
          }
          const abortSignal = signal !== null && signal !== void 0 ? signal : exports.webAuthnAbortService.createNewAbortSignal();
          if (challengeResponse.webauthn.type === "create") {
            const { user } = challengeResponse.webauthn.credential_options.publicKey;
            if (!user.name) {
              user.name = `${user.id}:${friendlyName}`;
            }
            if (!user.displayName) {
              user.displayName = user.name;
            }
          }
          switch (challengeResponse.webauthn.type) {
            case "create": {
              const options = mergeCredentialCreationOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.create);
              const { data, error } = await createCredential({
                publicKey: options,
                signal: abortSignal
              });
              if (data) {
                return {
                  data: {
                    factorId,
                    challengeId: challengeResponse.id,
                    webauthn: {
                      type: challengeResponse.webauthn.type,
                      credential_response: data
                    }
                  },
                  error: null
                };
              }
              return { data: null, error };
            }
            case "request": {
              const options = mergeCredentialRequestOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.request);
              const { data, error } = await getCredential(Object.assign(Object.assign({}, challengeResponse.webauthn.credential_options), { publicKey: options, signal: abortSignal }));
              if (data) {
                return {
                  data: {
                    factorId,
                    challengeId: challengeResponse.id,
                    webauthn: {
                      type: challengeResponse.webauthn.type,
                      credential_response: data
                    }
                  },
                  error: null
                };
              }
              return { data: null, error };
            }
          }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          return {
            data: null,
            error: new errors_1.AuthUnknownError("Unexpected error in challenge", error)
          };
        }
      }
      /**
       * Verify a WebAuthn credential with the server.
       * Completes the WebAuthn ceremony by sending the credential to the server for verification.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Verification parameters
       * @param {string} params.challengeId - ID of the challenge being verified
       * @param {string} params.factorId - ID of the WebAuthn factor
       * @param {MFAVerifyWebauthnParams<T>['webauthn']} params.webauthn - WebAuthn credential response
       * @returns {Promise<AuthMFAVerifyResponse>} Verification result with session or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying an Authentication Assertion}
       * */
      async _verify({ challengeId, factorId, webauthn }) {
        return this.client.mfa.verify({
          factorId,
          challengeId,
          webauthn
        });
      }
      /**
       * Complete WebAuthn authentication flow.
       * Performs challenge and verification in a single operation for existing credentials.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Authentication parameters
       * @param {string} params.factorId - ID of the WebAuthn factor to authenticate with
       * @param {Object} params.webauthn - WebAuthn configuration
       * @param {string} params.webauthn.rpId - Relying Party ID (defaults to current hostname)
       * @param {string[]} params.webauthn.rpOrigins - Allowed origins (defaults to current origin)
       * @param {AbortSignal} params.webauthn.signal - Optional abort signal
       * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Override options for navigator.credentials.get
       * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Authentication result
       * @see {@link https://w3c.github.io/webauthn/#sctn-authentication W3C WebAuthn Spec - Authentication Ceremony}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialRequestOptions MDN - PublicKeyCredentialRequestOptions}
       */
      async _authenticate({ factorId, webauthn: { rpId = typeof window !== "undefined" ? window.location.hostname : void 0, rpOrigins = typeof window !== "undefined" ? [window.location.origin] : void 0, signal } = {} }, overrides) {
        if (!rpId) {
          return {
            data: null,
            error: new errors_1.AuthError("rpId is required for WebAuthn authentication")
          };
        }
        try {
          if (!browserSupportsWebAuthn()) {
            return {
              data: null,
              error: new errors_1.AuthUnknownError("Browser does not support WebAuthn", null)
            };
          }
          const { data: challengeResponse, error: challengeError } = await this.challenge({
            factorId,
            webauthn: { rpId, rpOrigins },
            signal
          }, { request: overrides });
          if (!challengeResponse) {
            return { data: null, error: challengeError };
          }
          const { webauthn } = challengeResponse;
          return this._verify({
            factorId,
            challengeId: challengeResponse.challengeId,
            webauthn: {
              type: webauthn.type,
              rpId,
              rpOrigins,
              credential_response: webauthn.credential_response
            }
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          return {
            data: null,
            error: new errors_1.AuthUnknownError("Unexpected error in authenticate", error)
          };
        }
      }
      /**
       * Complete WebAuthn registration flow.
       * Performs enrollment, challenge, and verification in a single operation for new credentials.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Registration parameters
       * @param {string} params.friendlyName - User-friendly name for the credential
       * @param {string} params.rpId - Relying Party ID (defaults to current hostname)
       * @param {string[]} params.rpOrigins - Allowed origins (defaults to current origin)
       * @param {AbortSignal} params.signal - Optional abort signal
       * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Override options for navigator.credentials.create
       * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Registration result
       * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registration Ceremony}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions MDN - PublicKeyCredentialCreationOptions}
       */
      async _register({ friendlyName, webauthn: { rpId = typeof window !== "undefined" ? window.location.hostname : void 0, rpOrigins = typeof window !== "undefined" ? [window.location.origin] : void 0, signal } = {} }, overrides) {
        if (!rpId) {
          return {
            data: null,
            error: new errors_1.AuthError("rpId is required for WebAuthn registration")
          };
        }
        try {
          if (!browserSupportsWebAuthn()) {
            return {
              data: null,
              error: new errors_1.AuthUnknownError("Browser does not support WebAuthn", null)
            };
          }
          const { data: factor, error: enrollError } = await this._enroll({
            friendlyName
          });
          if (!factor) {
            await this.client.mfa.listFactors().then((factors) => {
              var _a;
              return (_a = factors.data) === null || _a === void 0 ? void 0 : _a.all.find((v) => v.factor_type === "webauthn" && v.friendly_name === friendlyName && v.status !== "unverified");
            }).then((factor2) => factor2 ? this.client.mfa.unenroll({ factorId: factor2 === null || factor2 === void 0 ? void 0 : factor2.id }) : void 0);
            return { data: null, error: enrollError };
          }
          const { data: challengeResponse, error: challengeError } = await this._challenge({
            factorId: factor.id,
            friendlyName: factor.friendly_name,
            webauthn: { rpId, rpOrigins },
            signal
          }, {
            create: overrides
          });
          if (!challengeResponse) {
            return { data: null, error: challengeError };
          }
          return this._verify({
            factorId: factor.id,
            challengeId: challengeResponse.challengeId,
            webauthn: {
              rpId,
              rpOrigins,
              type: challengeResponse.webauthn.type,
              credential_response: challengeResponse.webauthn.credential_response
            }
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error };
          }
          return {
            data: null,
            error: new errors_1.AuthUnknownError("Unexpected error in register", error)
          };
        }
      }
    };
    __name(WebAuthnApi, "WebAuthnApi");
    exports.WebAuthnApi = WebAuthnApi;
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/GoTrueClient.js
var require_GoTrueClient = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/GoTrueClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var GoTrueAdminApi_1 = tslib_1.__importDefault(require_GoTrueAdminApi());
    var constants_1 = require_constants5();
    var errors_1 = require_errors3();
    var fetch_1 = require_fetch4();
    var helpers_1 = require_helpers4();
    var local_storage_1 = require_local_storage();
    var locks_1 = require_locks();
    var polyfills_1 = require_polyfills();
    var version_1 = require_version4();
    var base64url_1 = require_base64url();
    var ethereum_1 = require_ethereum();
    var webauthn_1 = require_webauthn();
    (0, polyfills_1.polyfillGlobalThis)();
    var DEFAULT_OPTIONS = {
      url: constants_1.GOTRUE_URL,
      storageKey: constants_1.STORAGE_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      headers: constants_1.DEFAULT_HEADERS,
      flowType: "implicit",
      debug: false,
      hasCustomAuthorizationHeader: false,
      throwOnError: false
    };
    async function lockNoOp(name, acquireTimeout, fn) {
      return await fn();
    }
    __name(lockNoOp, "lockNoOp");
    var GLOBAL_JWKS = {};
    var GoTrueClient2 = class {
      /**
       * The JWKS used for verifying asymmetric JWTs
       */
      get jwks() {
        var _a, _b;
        return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.jwks) !== null && _b !== void 0 ? _b : { keys: [] };
      }
      set jwks(value) {
        GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { jwks: value });
      }
      get jwks_cached_at() {
        var _a, _b;
        return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.cachedAt) !== null && _b !== void 0 ? _b : Number.MIN_SAFE_INTEGER;
      }
      set jwks_cached_at(value) {
        GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { cachedAt: value });
      }
      /**
       * Create a new client for use in the browser.
       *
       * @example
       * ```ts
       * import { GoTrueClient } from '@supabase/auth-js'
       *
       * const auth = new GoTrueClient({
       *   url: 'https://xyzcompany.supabase.co/auth/v1',
       *   headers: { apikey: 'public-anon-key' },
       *   storageKey: 'supabase-auth',
       * })
       * ```
       */
      constructor(options) {
        var _a, _b, _c;
        this.userStorage = null;
        this.memoryStorage = null;
        this.stateChangeEmitters = /* @__PURE__ */ new Map();
        this.autoRefreshTicker = null;
        this.visibilityChangedCallback = null;
        this.refreshingDeferred = null;
        this.initializePromise = null;
        this.detectSessionInUrl = true;
        this.hasCustomAuthorizationHeader = false;
        this.suppressGetSessionWarning = false;
        this.lockAcquired = false;
        this.pendingInLock = [];
        this.broadcastChannel = null;
        this.logger = console.log;
        const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
        this.storageKey = settings.storageKey;
        this.instanceID = (_a = GoTrueClient2.nextInstanceID[this.storageKey]) !== null && _a !== void 0 ? _a : 0;
        GoTrueClient2.nextInstanceID[this.storageKey] = this.instanceID + 1;
        this.logDebugMessages = !!settings.debug;
        if (typeof settings.debug === "function") {
          this.logger = settings.debug;
        }
        if (this.instanceID > 0 && (0, helpers_1.isBrowser)()) {
          const message = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
          console.warn(message);
          if (this.logDebugMessages) {
            console.trace(message);
          }
        }
        this.persistSession = settings.persistSession;
        this.autoRefreshToken = settings.autoRefreshToken;
        this.admin = new GoTrueAdminApi_1.default({
          url: settings.url,
          headers: settings.headers,
          fetch: settings.fetch
        });
        this.url = settings.url;
        this.headers = settings.headers;
        this.fetch = (0, helpers_1.resolveFetch)(settings.fetch);
        this.lock = settings.lock || lockNoOp;
        this.detectSessionInUrl = settings.detectSessionInUrl;
        this.flowType = settings.flowType;
        this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
        this.throwOnError = settings.throwOnError;
        if (settings.lock) {
          this.lock = settings.lock;
        } else if ((0, helpers_1.isBrowser)() && ((_b = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _b === void 0 ? void 0 : _b.locks)) {
          this.lock = locks_1.navigatorLock;
        } else {
          this.lock = lockNoOp;
        }
        if (!this.jwks) {
          this.jwks = { keys: [] };
          this.jwks_cached_at = Number.MIN_SAFE_INTEGER;
        }
        this.mfa = {
          verify: this._verify.bind(this),
          enroll: this._enroll.bind(this),
          unenroll: this._unenroll.bind(this),
          challenge: this._challenge.bind(this),
          listFactors: this._listFactors.bind(this),
          challengeAndVerify: this._challengeAndVerify.bind(this),
          getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
          webauthn: new webauthn_1.WebAuthnApi(this)
        };
        this.oauth = {
          getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
          approveAuthorization: this._approveAuthorization.bind(this),
          denyAuthorization: this._denyAuthorization.bind(this),
          listGrants: this._listOAuthGrants.bind(this),
          revokeGrant: this._revokeOAuthGrant.bind(this)
        };
        if (this.persistSession) {
          if (settings.storage) {
            this.storage = settings.storage;
          } else {
            if ((0, helpers_1.supportsLocalStorage)()) {
              this.storage = globalThis.localStorage;
            } else {
              this.memoryStorage = {};
              this.storage = (0, local_storage_1.memoryLocalStorageAdapter)(this.memoryStorage);
            }
          }
          if (settings.userStorage) {
            this.userStorage = settings.userStorage;
          }
        } else {
          this.memoryStorage = {};
          this.storage = (0, local_storage_1.memoryLocalStorageAdapter)(this.memoryStorage);
        }
        if ((0, helpers_1.isBrowser)() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
          try {
            this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
          } catch (e) {
            console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", e);
          }
          (_c = this.broadcastChannel) === null || _c === void 0 ? void 0 : _c.addEventListener("message", async (event) => {
            this._debug("received broadcast notification from other tab or client", event);
            await this._notifyAllSubscribers(event.data.event, event.data.session, false);
          });
        }
        this.initialize();
      }
      /**
       * Returns whether error throwing mode is enabled for this client.
       */
      isThrowOnErrorEnabled() {
        return this.throwOnError;
      }
      /**
       * Centralizes return handling with optional error throwing. When `throwOnError` is enabled
       * and the provided result contains a non-nullish error, the error is thrown instead of
       * being returned. This ensures consistent behavior across all public API methods.
       */
      _returnResult(result) {
        if (this.throwOnError && result && result.error) {
          throw result.error;
        }
        return result;
      }
      _logPrefix() {
        return `GoTrueClient@${this.storageKey}:${this.instanceID} (${version_1.version}) ${(/* @__PURE__ */ new Date()).toISOString()}`;
      }
      _debug(...args) {
        if (this.logDebugMessages) {
          this.logger(this._logPrefix(), ...args);
        }
        return this;
      }
      /**
       * Initializes the client session either from the url or from storage.
       * This method is automatically called when instantiating the client, but should also be called
       * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
       */
      async initialize() {
        if (this.initializePromise) {
          return await this.initializePromise;
        }
        this.initializePromise = (async () => {
          return await this._acquireLock(-1, async () => {
            return await this._initialize();
          });
        })();
        return await this.initializePromise;
      }
      /**
       * IMPORTANT:
       * 1. Never throw in this method, as it is called from the constructor
       * 2. Never return a session from this method as it would be cached over
       *    the whole lifetime of the client
       */
      async _initialize() {
        var _a;
        try {
          let params = {};
          let callbackUrlType = "none";
          if ((0, helpers_1.isBrowser)()) {
            params = (0, helpers_1.parseParametersFromURL)(window.location.href);
            if (this._isImplicitGrantCallback(params)) {
              callbackUrlType = "implicit";
            } else if (await this._isPKCECallback(params)) {
              callbackUrlType = "pkce";
            }
          }
          if ((0, helpers_1.isBrowser)() && this.detectSessionInUrl && callbackUrlType !== "none") {
            const { data, error } = await this._getSessionFromURL(params, callbackUrlType);
            if (error) {
              this._debug("#_initialize()", "error detecting session from URL", error);
              if ((0, errors_1.isAuthImplicitGrantRedirectError)(error)) {
                const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code;
                if (errorCode === "identity_already_exists" || errorCode === "identity_not_found" || errorCode === "single_identity_not_deletable") {
                  return { error };
                }
              }
              await this._removeSession();
              return { error };
            }
            const { session, redirectType } = data;
            this._debug("#_initialize()", "detected session in URL", session, "redirect type", redirectType);
            await this._saveSession(session);
            setTimeout(async () => {
              if (redirectType === "recovery") {
                await this._notifyAllSubscribers("PASSWORD_RECOVERY", session);
              } else {
                await this._notifyAllSubscribers("SIGNED_IN", session);
              }
            }, 0);
            return { error: null };
          }
          await this._recoverAndRefresh();
          return { error: null };
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ error });
          }
          return this._returnResult({
            error: new errors_1.AuthUnknownError("Unexpected error during initialization", error)
          });
        } finally {
          await this._handleVisibilityChange();
          this._debug("#_initialize()", "end");
        }
      }
      /**
       * Creates a new anonymous user.
       *
       * @returns A session where the is_anonymous claim in the access token JWT set to true
       */
      async signInAnonymously(credentials) {
        var _a, _b, _c;
        try {
          const res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            body: {
              data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
              gotrue_meta_security: { captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken }
            },
            xform: fetch_1._sessionResponse
          });
          const { data, error } = res;
          if (error || !data) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          const session = data.session;
          const user = data.user;
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", session);
          }
          return this._returnResult({ data: { user, session }, error: null });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Creates a new user.
       *
       * Be aware that if a user account exists in the system you may get back an
       * error message that attempts to hide this information from the user.
       * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
       *
       * @returns A logged-in session if the server has "autoconfirm" ON
       * @returns A user if the server has "autoconfirm" OFF
       */
      async signUp(credentials) {
        var _a, _b, _c;
        try {
          let res;
          if ("email" in credentials) {
            const { email, password, options } = credentials;
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === "pkce") {
              ;
              [codeChallenge, codeChallengeMethod] = await (0, helpers_1.getCodeChallengeAndMethod)(this.storage, this.storageKey);
            }
            res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/signup`, {
              headers: this.headers,
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
              body: {
                email,
                password,
                data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod
              },
              xform: fetch_1._sessionResponse
            });
          } else if ("phone" in credentials) {
            const { phone, password, options } = credentials;
            res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/signup`, {
              headers: this.headers,
              body: {
                phone,
                password,
                data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
                channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : "sms",
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              xform: fetch_1._sessionResponse
            });
          } else {
            throw new errors_1.AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
          }
          const { data, error } = res;
          if (error || !data) {
            await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          const session = data.session;
          const user = data.user;
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", session);
          }
          return this._returnResult({ data: { user, session }, error: null });
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Log in an existing user with an email and password or phone and password.
       *
       * Be aware that you may get back an error message that will not distinguish
       * between the cases where the account does not exist or that the
       * email/phone and password combination is wrong or that the account can only
       * be accessed via social login.
       */
      async signInWithPassword(credentials) {
        try {
          let res;
          if ("email" in credentials) {
            const { email, password, options } = credentials;
            res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
              headers: this.headers,
              body: {
                email,
                password,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              xform: fetch_1._sessionResponsePassword
            });
          } else if ("phone" in credentials) {
            const { phone, password, options } = credentials;
            res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
              headers: this.headers,
              body: {
                phone,
                password,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              xform: fetch_1._sessionResponsePassword
            });
          } else {
            throw new errors_1.AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
          }
          const { data, error } = res;
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error });
          } else if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError();
            return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({
            data: Object.assign({ user: data.user, session: data.session }, data.weak_password ? { weakPassword: data.weak_password } : null),
            error
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Log in an existing user via a third-party provider.
       * This method supports the PKCE flow.
       */
      async signInWithOAuth(credentials) {
        var _a, _b, _c, _d;
        return await this._handleProviderSignIn(credentials.provider, {
          redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
          scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
          queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
          skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect
        });
      }
      /**
       * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
       */
      async exchangeCodeForSession(authCode) {
        await this.initializePromise;
        return this._acquireLock(-1, async () => {
          return this._exchangeCodeForSession(authCode);
        });
      }
      /**
       * Signs in a user by verifying a message signed by the user's private key.
       * Supports Ethereum (via Sign-In-With-Ethereum) & Solana (Sign-In-With-Solana) standards,
       * both of which derive from the EIP-4361 standard
       * With slight variation on Solana's side.
       * @reference https://eips.ethereum.org/EIPS/eip-4361
       */
      async signInWithWeb3(credentials) {
        const { chain } = credentials;
        switch (chain) {
          case "ethereum":
            return await this.signInWithEthereum(credentials);
          case "solana":
            return await this.signInWithSolana(credentials);
          default:
            throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`);
        }
      }
      async signInWithEthereum(credentials) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        let message;
        let signature;
        if ("message" in credentials) {
          message = credentials.message;
          signature = credentials.signature;
        } else {
          const { chain, wallet, statement, options } = credentials;
          let resolvedWallet;
          if (!(0, helpers_1.isBrowser)()) {
            if (typeof wallet !== "object" || !(options === null || options === void 0 ? void 0 : options.url)) {
              throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
            }
            resolvedWallet = wallet;
          } else if (typeof wallet === "object") {
            resolvedWallet = wallet;
          } else {
            const windowAny = window;
            if ("ethereum" in windowAny && typeof windowAny.ethereum === "object" && "request" in windowAny.ethereum && typeof windowAny.ethereum.request === "function") {
              resolvedWallet = windowAny.ethereum;
            } else {
              throw new Error(`@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.`);
            }
          }
          const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
          const accounts = await resolvedWallet.request({
            method: "eth_requestAccounts"
          }).then((accs) => accs).catch(() => {
            throw new Error(`@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid`);
          });
          if (!accounts || accounts.length === 0) {
            throw new Error(`@supabase/auth-js: No accounts available. Please ensure the wallet is connected.`);
          }
          const address = (0, ethereum_1.getAddress)(accounts[0]);
          let chainId = (_b = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _b === void 0 ? void 0 : _b.chainId;
          if (!chainId) {
            const chainIdHex = await resolvedWallet.request({
              method: "eth_chainId"
            });
            chainId = (0, ethereum_1.fromHex)(chainIdHex);
          }
          const siweMessage = {
            domain: url.host,
            address,
            statement,
            uri: url.href,
            version: "1",
            chainId,
            nonce: (_c = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _c === void 0 ? void 0 : _c.nonce,
            issuedAt: (_e = (_d = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _d === void 0 ? void 0 : _d.issuedAt) !== null && _e !== void 0 ? _e : /* @__PURE__ */ new Date(),
            expirationTime: (_f = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _f === void 0 ? void 0 : _f.expirationTime,
            notBefore: (_g = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _g === void 0 ? void 0 : _g.notBefore,
            requestId: (_h = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _h === void 0 ? void 0 : _h.requestId,
            resources: (_j = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _j === void 0 ? void 0 : _j.resources
          };
          message = (0, ethereum_1.createSiweMessage)(siweMessage);
          signature = await resolvedWallet.request({
            method: "personal_sign",
            params: [(0, ethereum_1.toHex)(message), address]
          });
        }
        try {
          const { data, error } = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
            headers: this.headers,
            body: Object.assign({
              chain: "ethereum",
              message,
              signature
            }, ((_k = credentials.options) === null || _k === void 0 ? void 0 : _k.captchaToken) ? { gotrue_meta_security: { captcha_token: (_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken } } : null),
            xform: fetch_1._sessionResponse
          });
          if (error) {
            throw error;
          }
          if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError();
            return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({ data: Object.assign({}, data), error });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      async signInWithSolana(credentials) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        let message;
        let signature;
        if ("message" in credentials) {
          message = credentials.message;
          signature = credentials.signature;
        } else {
          const { chain, wallet, statement, options } = credentials;
          let resolvedWallet;
          if (!(0, helpers_1.isBrowser)()) {
            if (typeof wallet !== "object" || !(options === null || options === void 0 ? void 0 : options.url)) {
              throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
            }
            resolvedWallet = wallet;
          } else if (typeof wallet === "object") {
            resolvedWallet = wallet;
          } else {
            const windowAny = window;
            if ("solana" in windowAny && typeof windowAny.solana === "object" && ("signIn" in windowAny.solana && typeof windowAny.solana.signIn === "function" || "signMessage" in windowAny.solana && typeof windowAny.solana.signMessage === "function")) {
              resolvedWallet = windowAny.solana;
            } else {
              throw new Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`);
            }
          }
          const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
          if ("signIn" in resolvedWallet && resolvedWallet.signIn) {
            const output = await resolvedWallet.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, options === null || options === void 0 ? void 0 : options.signInWithSolana), {
              // non-overridable properties
              version: "1",
              domain: url.host,
              uri: url.href
            }), statement ? { statement } : null));
            let outputToProcess;
            if (Array.isArray(output) && output[0] && typeof output[0] === "object") {
              outputToProcess = output[0];
            } else if (output && typeof output === "object" && "signedMessage" in output && "signature" in output) {
              outputToProcess = output;
            } else {
              throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
            }
            if ("signedMessage" in outputToProcess && "signature" in outputToProcess && (typeof outputToProcess.signedMessage === "string" || outputToProcess.signedMessage instanceof Uint8Array) && outputToProcess.signature instanceof Uint8Array) {
              message = typeof outputToProcess.signedMessage === "string" ? outputToProcess.signedMessage : new TextDecoder().decode(outputToProcess.signedMessage);
              signature = outputToProcess.signature;
            } else {
              throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
            }
          } else {
            if (!("signMessage" in resolvedWallet) || typeof resolvedWallet.signMessage !== "function" || !("publicKey" in resolvedWallet) || typeof resolvedWallet !== "object" || !resolvedWallet.publicKey || !("toBase58" in resolvedWallet.publicKey) || typeof resolvedWallet.publicKey.toBase58 !== "function") {
              throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
            }
            message = [
              `${url.host} wants you to sign in with your Solana account:`,
              resolvedWallet.publicKey.toBase58(),
              ...statement ? ["", statement, ""] : [""],
              "Version: 1",
              `URI: ${url.href}`,
              `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : (/* @__PURE__ */ new Date()).toISOString()}`,
              ...((_d = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _d === void 0 ? void 0 : _d.notBefore) ? [`Not Before: ${options.signInWithSolana.notBefore}`] : [],
              ...((_e = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _e === void 0 ? void 0 : _e.expirationTime) ? [`Expiration Time: ${options.signInWithSolana.expirationTime}`] : [],
              ...((_f = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _f === void 0 ? void 0 : _f.chainId) ? [`Chain ID: ${options.signInWithSolana.chainId}`] : [],
              ...((_g = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _g === void 0 ? void 0 : _g.nonce) ? [`Nonce: ${options.signInWithSolana.nonce}`] : [],
              ...((_h = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _h === void 0 ? void 0 : _h.requestId) ? [`Request ID: ${options.signInWithSolana.requestId}`] : [],
              ...((_k = (_j = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _j === void 0 ? void 0 : _j.resources) === null || _k === void 0 ? void 0 : _k.length) ? [
                "Resources",
                ...options.signInWithSolana.resources.map((resource) => `- ${resource}`)
              ] : []
            ].join("\n");
            const maybeSignature = await resolvedWallet.signMessage(new TextEncoder().encode(message), "utf8");
            if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) {
              throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
            }
            signature = maybeSignature;
          }
        }
        try {
          const { data, error } = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
            headers: this.headers,
            body: Object.assign({ chain: "solana", message, signature: (0, base64url_1.bytesToBase64URL)(signature) }, ((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken) ? { gotrue_meta_security: { captcha_token: (_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken } } : null),
            xform: fetch_1._sessionResponse
          });
          if (error) {
            throw error;
          }
          if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError();
            return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({ data: Object.assign({}, data), error });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      async _exchangeCodeForSession(authCode) {
        const storageItem = await (0, helpers_1.getItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
        const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : "").split("/");
        try {
          const { data, error } = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
            headers: this.headers,
            body: {
              auth_code: authCode,
              code_verifier: codeVerifier
            },
            xform: fetch_1._sessionResponse
          });
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
          if (error) {
            throw error;
          }
          if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError();
            return this._returnResult({
              data: { user: null, session: null, redirectType: null },
              error: invalidTokenError
            });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({ data: Object.assign(Object.assign({}, data), { redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null }), error });
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({
              data: { user: null, session: null, redirectType: null },
              error
            });
          }
          throw error;
        }
      }
      /**
       * Allows signing in with an OIDC ID token. The authentication provider used
       * should be enabled and configured.
       */
      async signInWithIdToken(credentials) {
        try {
          const { options, provider, token, access_token, nonce } = credentials;
          const res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
            headers: this.headers,
            body: {
              provider,
              id_token: token,
              access_token,
              nonce,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: fetch_1._sessionResponse
          });
          const { data, error } = res;
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error });
          } else if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError();
            return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({ data, error });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Log in a user using magiclink or a one-time password (OTP).
       *
       * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
       * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
       * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
       *
       * Be aware that you may get back an error message that will not distinguish
       * between the cases where the account does not exist or, that the account
       * can only be accessed via social login.
       *
       * Do note that you will need to configure a Whatsapp sender on Twilio
       * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
       * channel is not supported on other providers
       * at this time.
       * This method supports PKCE when an email is passed.
       */
      async signInWithOtp(credentials) {
        var _a, _b, _c, _d, _e;
        try {
          if ("email" in credentials) {
            const { email, options } = credentials;
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === "pkce") {
              ;
              [codeChallenge, codeChallengeMethod] = await (0, helpers_1.getCodeChallengeAndMethod)(this.storage, this.storageKey);
            }
            const { error } = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/otp`, {
              headers: this.headers,
              body: {
                email,
                data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod
              },
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
            });
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          if ("phone" in credentials) {
            const { phone, options } = credentials;
            const { data, error } = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/otp`, {
              headers: this.headers,
              body: {
                phone,
                data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
                create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : "sms"
              }
            });
            return this._returnResult({
              data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
              error
            });
          }
          throw new errors_1.AuthInvalidCredentialsError("You must provide either an email or phone number.");
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
       */
      async verifyOtp(params) {
        var _a, _b;
        try {
          let redirectTo = void 0;
          let captchaToken = void 0;
          if ("options" in params) {
            redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
            captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
          }
          const { data, error } = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/verify`, {
            headers: this.headers,
            body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: captchaToken } }),
            redirectTo,
            xform: fetch_1._sessionResponse
          });
          if (error) {
            throw error;
          }
          if (!data) {
            const tokenVerificationError = new Error("An error occurred on token verification.");
            throw tokenVerificationError;
          }
          const session = data.session;
          const user = data.user;
          if (session === null || session === void 0 ? void 0 : session.access_token) {
            await this._saveSession(session);
            await this._notifyAllSubscribers(params.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", session);
          }
          return this._returnResult({ data: { user, session }, error: null });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Attempts a single-sign on using an enterprise Identity Provider. A
       * successful SSO attempt will redirect the current page to the identity
       * provider authorization page. The redirect URL is implementation and SSO
       * protocol specific.
       *
       * You can use it by providing a SSO domain. Typically you can extract this
       * domain by asking users for their email address. If this domain is
       * registered on the Auth instance the redirect will use that organization's
       * currently active SSO Identity Provider for the login.
       *
       * If you have built an organization-specific login page, you can use the
       * organization's SSO Identity Provider UUID directly instead.
       */
      async signInWithSSO(params) {
        var _a, _b, _c, _d, _e;
        try {
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce") {
            ;
            [codeChallenge, codeChallengeMethod] = await (0, helpers_1.getCodeChallengeAndMethod)(this.storage, this.storageKey);
          }
          const result = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/sso`, {
            body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in params ? { provider_id: params.providerId } : null), "domain" in params ? { domain: params.domain } : null), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : void 0 }), ((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken) ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } } : null), { skip_http_redirect: true, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
            headers: this.headers,
            xform: fetch_1._ssoResponse
          });
          if (((_d = result.data) === null || _d === void 0 ? void 0 : _d.url) && (0, helpers_1.isBrowser)() && !((_e = params.options) === null || _e === void 0 ? void 0 : _e.skipBrowserRedirect)) {
            window.location.assign(result.data.url);
          }
          return this._returnResult(result);
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Sends a reauthentication OTP to the user's email or phone number.
       * Requires the user to be signed-in.
       */
      async reauthenticate() {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._reauthenticate();
        });
      }
      async _reauthenticate() {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError)
              throw sessionError;
            if (!session)
              throw new errors_1.AuthSessionMissingError();
            const { error } = await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/reauthenticate`, {
              headers: this.headers,
              jwt: session.access_token
            });
            return this._returnResult({ data: { user: null, session: null }, error });
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
       */
      async resend(credentials) {
        try {
          const endpoint = `${this.url}/resend`;
          if ("email" in credentials) {
            const { email, type, options } = credentials;
            const { error } = await (0, fetch_1._request)(this.fetch, "POST", endpoint, {
              headers: this.headers,
              body: {
                email,
                type,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
            });
            return this._returnResult({ data: { user: null, session: null }, error });
          } else if ("phone" in credentials) {
            const { phone, type, options } = credentials;
            const { data, error } = await (0, fetch_1._request)(this.fetch, "POST", endpoint, {
              headers: this.headers,
              body: {
                phone,
                type,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              }
            });
            return this._returnResult({
              data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
              error
            });
          }
          throw new errors_1.AuthInvalidCredentialsError("You must provide either an email or phone number and a type");
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Returns the session, refreshing it if necessary.
       *
       * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
       *
       * **IMPORTANT:** This method loads values directly from the storage attached
       * to the client. If that storage is based on request cookies for example,
       * the values in it may not be authentic and therefore it's strongly advised
       * against using this method and its results in such circumstances. A warning
       * will be emitted if this is detected. Use {@link #getUser()} instead.
       */
      async getSession() {
        await this.initializePromise;
        const result = await this._acquireLock(-1, async () => {
          return this._useSession(async (result2) => {
            return result2;
          });
        });
        return result;
      }
      /**
       * Acquires a global lock based on the storage key.
       */
      async _acquireLock(acquireTimeout, fn) {
        this._debug("#_acquireLock", "begin", acquireTimeout);
        try {
          if (this.lockAcquired) {
            const last = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve();
            const result = (async () => {
              await last;
              return await fn();
            })();
            this.pendingInLock.push((async () => {
              try {
                await result;
              } catch (e) {
              }
            })());
            return result;
          }
          return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
            this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
            try {
              this.lockAcquired = true;
              const result = fn();
              this.pendingInLock.push((async () => {
                try {
                  await result;
                } catch (e) {
                }
              })());
              await result;
              while (this.pendingInLock.length) {
                const waitOn = [...this.pendingInLock];
                await Promise.all(waitOn);
                this.pendingInLock.splice(0, waitOn.length);
              }
              return await result;
            } finally {
              this._debug("#_acquireLock", "lock released for storage key", this.storageKey);
              this.lockAcquired = false;
            }
          });
        } finally {
          this._debug("#_acquireLock", "end");
        }
      }
      /**
       * Use instead of {@link #getSession} inside the library. It is
       * semantically usually what you want, as getting a session involves some
       * processing afterwards that requires only one client operating on the
       * session at once across multiple tabs or processes.
       */
      async _useSession(fn) {
        this._debug("#_useSession", "begin");
        try {
          const result = await this.__loadSession();
          return await fn(result);
        } finally {
          this._debug("#_useSession", "end");
        }
      }
      /**
       * NEVER USE DIRECTLY!
       *
       * Always use {@link #_useSession}.
       */
      async __loadSession() {
        this._debug("#__loadSession()", "begin");
        if (!this.lockAcquired) {
          this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
        }
        try {
          let currentSession = null;
          const maybeSession = await (0, helpers_1.getItemAsync)(this.storage, this.storageKey);
          this._debug("#getSession()", "session from storage", maybeSession);
          if (maybeSession !== null) {
            if (this._isValidSession(maybeSession)) {
              currentSession = maybeSession;
            } else {
              this._debug("#getSession()", "session from storage is not valid");
              await this._removeSession();
            }
          }
          if (!currentSession) {
            return { data: { session: null }, error: null };
          }
          const hasExpired = currentSession.expires_at ? currentSession.expires_at * 1e3 - Date.now() < constants_1.EXPIRY_MARGIN_MS : false;
          this._debug("#__loadSession()", `session has${hasExpired ? "" : " not"} expired`, "expires_at", currentSession.expires_at);
          if (!hasExpired) {
            if (this.userStorage) {
              const maybeUser = await (0, helpers_1.getItemAsync)(this.userStorage, this.storageKey + "-user");
              if (maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) {
                currentSession.user = maybeUser.user;
              } else {
                currentSession.user = (0, helpers_1.userNotAvailableProxy)();
              }
            }
            if (this.storage.isServer && currentSession.user && !currentSession.user.__isUserNotAvailableProxy) {
              const suppressWarningRef = { value: this.suppressGetSessionWarning };
              currentSession.user = (0, helpers_1.insecureUserWarningProxy)(currentSession.user, suppressWarningRef);
              if (suppressWarningRef.value) {
                this.suppressGetSessionWarning = true;
              }
            }
            return { data: { session: currentSession }, error: null };
          }
          const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
          if (error) {
            return this._returnResult({ data: { session: null }, error });
          }
          return this._returnResult({ data: { session }, error: null });
        } finally {
          this._debug("#__loadSession()", "end");
        }
      }
      /**
       * Gets the current user details if there is an existing session. This method
       * performs a network request to the Supabase Auth server, so the returned
       * value is authentic and can be used to base authorization rules on.
       *
       * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
       */
      async getUser(jwt) {
        if (jwt) {
          return await this._getUser(jwt);
        }
        await this.initializePromise;
        const result = await this._acquireLock(-1, async () => {
          return await this._getUser();
        });
        if (result.data.user) {
          this.suppressGetSessionWarning = true;
        }
        return result;
      }
      async _getUser(jwt) {
        try {
          if (jwt) {
            return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/user`, {
              headers: this.headers,
              jwt,
              xform: fetch_1._userResponse
            });
          }
          return await this._useSession(async (result) => {
            var _a, _b, _c;
            const { data, error } = result;
            if (error) {
              throw error;
            }
            if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) {
              return { data: { user: null }, error: new errors_1.AuthSessionMissingError() };
            }
            return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/user`, {
              headers: this.headers,
              jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : void 0,
              xform: fetch_1._userResponse
            });
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            if ((0, errors_1.isAuthSessionMissingError)(error)) {
              await this._removeSession();
              await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
            }
            return this._returnResult({ data: { user: null }, error });
          }
          throw error;
        }
      }
      /**
       * Updates user data for a logged in user.
       */
      async updateUser(attributes, options = {}) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._updateUser(attributes, options);
        });
      }
      async _updateUser(attributes, options = {}) {
        try {
          return await this._useSession(async (result) => {
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              throw sessionError;
            }
            if (!sessionData.session) {
              throw new errors_1.AuthSessionMissingError();
            }
            const session = sessionData.session;
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === "pkce" && attributes.email != null) {
              ;
              [codeChallenge, codeChallengeMethod] = await (0, helpers_1.getCodeChallengeAndMethod)(this.storage, this.storageKey);
            }
            const { data, error: userError } = await (0, fetch_1._request)(this.fetch, "PUT", `${this.url}/user`, {
              headers: this.headers,
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
              body: Object.assign(Object.assign({}, attributes), { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
              jwt: session.access_token,
              xform: fetch_1._userResponse
            });
            if (userError) {
              throw userError;
            }
            session.user = data.user;
            await this._saveSession(session);
            await this._notifyAllSubscribers("USER_UPDATED", session);
            return this._returnResult({ data: { user: session.user }, error: null });
          });
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null }, error });
          }
          throw error;
        }
      }
      /**
       * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
       * If the refresh token or access token in the current session is invalid, an error will be thrown.
       * @param currentSession The current session that minimally contains an access token and refresh token.
       */
      async setSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._setSession(currentSession);
        });
      }
      async _setSession(currentSession) {
        try {
          if (!currentSession.access_token || !currentSession.refresh_token) {
            throw new errors_1.AuthSessionMissingError();
          }
          const timeNow = Date.now() / 1e3;
          let expiresAt = timeNow;
          let hasExpired = true;
          let session = null;
          const { payload } = (0, helpers_1.decodeJWT)(currentSession.access_token);
          if (payload.exp) {
            expiresAt = payload.exp;
            hasExpired = expiresAt <= timeNow;
          }
          if (hasExpired) {
            const { data: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) {
              return this._returnResult({ data: { user: null, session: null }, error });
            }
            if (!refreshedSession) {
              return { data: { user: null, session: null }, error: null };
            }
            session = refreshedSession;
          } else {
            const { data, error } = await this._getUser(currentSession.access_token);
            if (error) {
              throw error;
            }
            session = {
              access_token: currentSession.access_token,
              refresh_token: currentSession.refresh_token,
              user: data.user,
              token_type: "bearer",
              expires_in: expiresAt - timeNow,
              expires_at: expiresAt
            };
            await this._saveSession(session);
            await this._notifyAllSubscribers("SIGNED_IN", session);
          }
          return this._returnResult({ data: { user: session.user, session }, error: null });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { session: null, user: null }, error });
          }
          throw error;
        }
      }
      /**
       * Returns a new session, regardless of expiry status.
       * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
       * If the current session's refresh token is invalid, an error will be thrown.
       * @param currentSession The current session. If passed in, it must contain a refresh token.
       */
      async refreshSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._refreshSession(currentSession);
        });
      }
      async _refreshSession(currentSession) {
        try {
          return await this._useSession(async (result) => {
            var _a;
            if (!currentSession) {
              const { data, error: error2 } = result;
              if (error2) {
                throw error2;
              }
              currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : void 0;
            }
            if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
              throw new errors_1.AuthSessionMissingError();
            }
            const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) {
              return this._returnResult({ data: { user: null, session: null }, error });
            }
            if (!session) {
              return this._returnResult({ data: { user: null, session: null }, error: null });
            }
            return this._returnResult({ data: { user: session.user, session }, error: null });
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Gets the session data from a URL string
       */
      async _getSessionFromURL(params, callbackUrlType) {
        try {
          if (!(0, helpers_1.isBrowser)())
            throw new errors_1.AuthImplicitGrantRedirectError("No browser detected.");
          if (params.error || params.error_description || params.error_code) {
            throw new errors_1.AuthImplicitGrantRedirectError(params.error_description || "Error in URL with unspecified error_description", {
              error: params.error || "unspecified_error",
              code: params.error_code || "unspecified_code"
            });
          }
          switch (callbackUrlType) {
            case "implicit":
              if (this.flowType === "pkce") {
                throw new errors_1.AuthPKCEGrantCodeExchangeError("Not a valid PKCE flow url.");
              }
              break;
            case "pkce":
              if (this.flowType === "implicit") {
                throw new errors_1.AuthImplicitGrantRedirectError("Not a valid implicit grant flow url.");
              }
              break;
            default:
          }
          if (callbackUrlType === "pkce") {
            this._debug("#_initialize()", "begin", "is PKCE flow", true);
            if (!params.code)
              throw new errors_1.AuthPKCEGrantCodeExchangeError("No code detected.");
            const { data: data2, error: error2 } = await this._exchangeCodeForSession(params.code);
            if (error2)
              throw error2;
            const url = new URL(window.location.href);
            url.searchParams.delete("code");
            window.history.replaceState(window.history.state, "", url.toString());
            return { data: { session: data2.session, redirectType: null }, error: null };
          }
          const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type } = params;
          if (!access_token || !expires_in || !refresh_token || !token_type) {
            throw new errors_1.AuthImplicitGrantRedirectError("No session defined in URL");
          }
          const timeNow = Math.round(Date.now() / 1e3);
          const expiresIn = parseInt(expires_in);
          let expiresAt = timeNow + expiresIn;
          if (expires_at) {
            expiresAt = parseInt(expires_at);
          }
          const actuallyExpiresIn = expiresAt - timeNow;
          if (actuallyExpiresIn * 1e3 <= constants_1.AUTO_REFRESH_TICK_DURATION_MS) {
            console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
          }
          const issuedAt = expiresAt - expiresIn;
          if (timeNow - issuedAt >= 120) {
            console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", issuedAt, expiresAt, timeNow);
          } else if (timeNow - issuedAt < 0) {
            console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", issuedAt, expiresAt, timeNow);
          }
          const { data, error } = await this._getUser(access_token);
          if (error)
            throw error;
          const session = {
            provider_token,
            provider_refresh_token,
            access_token,
            expires_in: expiresIn,
            expires_at: expiresAt,
            refresh_token,
            token_type,
            user: data.user
          };
          window.location.hash = "";
          this._debug("#_getSessionFromURL()", "clearing window.location.hash");
          return this._returnResult({ data: { session, redirectType: params.type }, error: null });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { session: null, redirectType: null }, error });
          }
          throw error;
        }
      }
      /**
       * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
       */
      _isImplicitGrantCallback(params) {
        return Boolean(params.access_token || params.error_description);
      }
      /**
       * Checks if the current URL and backing storage contain parameters given by a PKCE flow
       */
      async _isPKCECallback(params) {
        const currentStorageContent = await (0, helpers_1.getItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
        return !!(params.code && currentStorageContent);
      }
      /**
       * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
       *
       * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
       * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
       *
       * If using `others` scope, no `SIGNED_OUT` event is fired!
       */
      async signOut(options = { scope: "global" }) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._signOut(options);
        });
      }
      async _signOut({ scope } = { scope: "global" }) {
        return await this._useSession(async (result) => {
          var _a;
          const { data, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ error: sessionError });
          }
          const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
          if (accessToken) {
            const { error } = await this.admin.signOut(accessToken, scope);
            if (error) {
              if (!((0, errors_1.isAuthApiError)(error) && (error.status === 404 || error.status === 401 || error.status === 403))) {
                return this._returnResult({ error });
              }
            }
          }
          if (scope !== "others") {
            await this._removeSession();
            await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
          }
          return this._returnResult({ error: null });
        });
      }
      onAuthStateChange(callback) {
        const id = (0, helpers_1.generateCallbackId)();
        const subscription = {
          id,
          callback,
          unsubscribe: () => {
            this._debug("#unsubscribe()", "state change callback with id removed", id);
            this.stateChangeEmitters.delete(id);
          }
        };
        this._debug("#onAuthStateChange()", "registered callback with id", id);
        this.stateChangeEmitters.set(id, subscription);
        (async () => {
          await this.initializePromise;
          await this._acquireLock(-1, async () => {
            this._emitInitialSession(id);
          });
        })();
        return { data: { subscription } };
      }
      async _emitInitialSession(id) {
        return await this._useSession(async (result) => {
          var _a, _b;
          try {
            const { data: { session }, error } = result;
            if (error)
              throw error;
            await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback("INITIAL_SESSION", session));
            this._debug("INITIAL_SESSION", "callback id", id, "session", session);
          } catch (err) {
            await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback("INITIAL_SESSION", null));
            this._debug("INITIAL_SESSION", "callback id", id, "error", err);
            console.error(err);
          }
        });
      }
      /**
       * Sends a password reset request to an email address. This method supports the PKCE flow.
       *
       * @param email The email address of the user.
       * @param options.redirectTo The URL to send the user to after they click the password reset link.
       * @param options.captchaToken Verification token received when the user completes the captcha on the site.
       */
      async resetPasswordForEmail(email, options = {}) {
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === "pkce") {
          ;
          [codeChallenge, codeChallengeMethod] = await (0, helpers_1.getCodeChallengeAndMethod)(
            this.storage,
            this.storageKey,
            true
            // isPasswordRecovery
          );
        }
        try {
          return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/recover`, {
            body: {
              email,
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod,
              gotrue_meta_security: { captcha_token: options.captchaToken }
            },
            headers: this.headers,
            redirectTo: options.redirectTo
          });
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Gets all the identities linked to a user.
       */
      async getUserIdentities() {
        var _a;
        try {
          const { data, error } = await this.getUser();
          if (error)
            throw error;
          return this._returnResult({ data: { identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : [] }, error: null });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      async linkIdentity(credentials) {
        if ("token" in credentials) {
          return this.linkIdentityIdToken(credentials);
        }
        return this.linkIdentityOAuth(credentials);
      }
      async linkIdentityOAuth(credentials) {
        var _a;
        try {
          const { data, error } = await this._useSession(async (result) => {
            var _a2, _b, _c, _d, _e;
            const { data: data2, error: error2 } = result;
            if (error2)
              throw error2;
            const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
              redirectTo: (_a2 = credentials.options) === null || _a2 === void 0 ? void 0 : _a2.redirectTo,
              scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
              queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
              skipBrowserRedirect: true
            });
            return await (0, fetch_1._request)(this.fetch, "GET", url, {
              headers: this.headers,
              jwt: (_e = (_d = data2.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : void 0
            });
          });
          if (error)
            throw error;
          if ((0, helpers_1.isBrowser)() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) {
            window.location.assign(data === null || data === void 0 ? void 0 : data.url);
          }
          return this._returnResult({
            data: { provider: credentials.provider, url: data === null || data === void 0 ? void 0 : data.url },
            error: null
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { provider: credentials.provider, url: null }, error });
          }
          throw error;
        }
      }
      async linkIdentityIdToken(credentials) {
        return await this._useSession(async (result) => {
          var _a;
          try {
            const { error: sessionError, data: { session } } = result;
            if (sessionError)
              throw sessionError;
            const { options, provider, token, access_token, nonce } = credentials;
            const res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
              headers: this.headers,
              jwt: (_a = session === null || session === void 0 ? void 0 : session.access_token) !== null && _a !== void 0 ? _a : void 0,
              body: {
                provider,
                id_token: token,
                access_token,
                nonce,
                link_identity: true,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              xform: fetch_1._sessionResponse
            });
            const { data, error } = res;
            if (error) {
              return this._returnResult({ data: { user: null, session: null }, error });
            } else if (!data || !data.session || !data.user) {
              return this._returnResult({
                data: { user: null, session: null },
                error: new errors_1.AuthInvalidTokenResponseError()
              });
            }
            if (data.session) {
              await this._saveSession(data.session);
              await this._notifyAllSubscribers("USER_UPDATED", data.session);
            }
            return this._returnResult({ data, error });
          } catch (error) {
            await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
            if ((0, errors_1.isAuthError)(error)) {
              return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
          }
        });
      }
      /**
       * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
       */
      async unlinkIdentity(identity) {
        try {
          return await this._useSession(async (result) => {
            var _a, _b;
            const { data, error } = result;
            if (error) {
              throw error;
            }
            return await (0, fetch_1._request)(this.fetch, "DELETE", `${this.url}/user/identities/${identity.identity_id}`, {
              headers: this.headers,
              jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : void 0
            });
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Generates a new JWT.
       * @param refreshToken A valid refresh token that was returned on login.
       */
      async _refreshAccessToken(refreshToken) {
        const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, "begin");
        try {
          const startedAt = Date.now();
          return await (0, helpers_1.retryable)(async (attempt) => {
            if (attempt > 0) {
              await (0, helpers_1.sleep)(200 * Math.pow(2, attempt - 1));
            }
            this._debug(debugName, "refreshing attempt", attempt);
            return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
              body: { refresh_token: refreshToken },
              headers: this.headers,
              xform: fetch_1._sessionResponse
            });
          }, (attempt, error) => {
            const nextBackOffInterval = 200 * Math.pow(2, attempt);
            return error && (0, errors_1.isAuthRetryableFetchError)(error) && // retryable only if the request can be sent before the backoff overflows the tick duration
            Date.now() + nextBackOffInterval - startedAt < constants_1.AUTO_REFRESH_TICK_DURATION_MS;
          });
        } catch (error) {
          this._debug(debugName, "error", error);
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { session: null, user: null }, error });
          }
          throw error;
        } finally {
          this._debug(debugName, "end");
        }
      }
      _isValidSession(maybeSession) {
        const isValidSession = typeof maybeSession === "object" && maybeSession !== null && "access_token" in maybeSession && "refresh_token" in maybeSession && "expires_at" in maybeSession;
        return isValidSession;
      }
      async _handleProviderSignIn(provider, options) {
        const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
          redirectTo: options.redirectTo,
          scopes: options.scopes,
          queryParams: options.queryParams
        });
        this._debug("#_handleProviderSignIn()", "provider", provider, "options", options, "url", url);
        if ((0, helpers_1.isBrowser)() && !options.skipBrowserRedirect) {
          window.location.assign(url);
        }
        return { data: { provider, url }, error: null };
      }
      /**
       * Recovers the session from LocalStorage and refreshes the token
       * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
       */
      async _recoverAndRefresh() {
        var _a, _b;
        const debugName = "#_recoverAndRefresh()";
        this._debug(debugName, "begin");
        try {
          const currentSession = await (0, helpers_1.getItemAsync)(this.storage, this.storageKey);
          if (currentSession && this.userStorage) {
            let maybeUser = await (0, helpers_1.getItemAsync)(this.userStorage, this.storageKey + "-user");
            if (!this.storage.isServer && Object.is(this.storage, this.userStorage) && !maybeUser) {
              maybeUser = { user: currentSession.user };
              await (0, helpers_1.setItemAsync)(this.userStorage, this.storageKey + "-user", maybeUser);
            }
            currentSession.user = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) !== null && _a !== void 0 ? _a : (0, helpers_1.userNotAvailableProxy)();
          } else if (currentSession && !currentSession.user) {
            if (!currentSession.user) {
              const separateUser = await (0, helpers_1.getItemAsync)(this.storage, this.storageKey + "-user");
              if (separateUser && (separateUser === null || separateUser === void 0 ? void 0 : separateUser.user)) {
                currentSession.user = separateUser.user;
                await (0, helpers_1.removeItemAsync)(this.storage, this.storageKey + "-user");
                await (0, helpers_1.setItemAsync)(this.storage, this.storageKey, currentSession);
              } else {
                currentSession.user = (0, helpers_1.userNotAvailableProxy)();
              }
            }
          }
          this._debug(debugName, "session from storage", currentSession);
          if (!this._isValidSession(currentSession)) {
            this._debug(debugName, "session is not valid");
            if (currentSession !== null) {
              await this._removeSession();
            }
            return;
          }
          const expiresWithMargin = ((_b = currentSession.expires_at) !== null && _b !== void 0 ? _b : Infinity) * 1e3 - Date.now() < constants_1.EXPIRY_MARGIN_MS;
          this._debug(debugName, `session has${expiresWithMargin ? "" : " not"} expired with margin of ${constants_1.EXPIRY_MARGIN_MS}s`);
          if (expiresWithMargin) {
            if (this.autoRefreshToken && currentSession.refresh_token) {
              const { error } = await this._callRefreshToken(currentSession.refresh_token);
              if (error) {
                console.error(error);
                if (!(0, errors_1.isAuthRetryableFetchError)(error)) {
                  this._debug(debugName, "refresh failed with a non-retryable error, removing the session", error);
                  await this._removeSession();
                }
              }
            }
          } else if (currentSession.user && currentSession.user.__isUserNotAvailableProxy === true) {
            try {
              const { data, error: userError } = await this._getUser(currentSession.access_token);
              if (!userError && (data === null || data === void 0 ? void 0 : data.user)) {
                currentSession.user = data.user;
                await this._saveSession(currentSession);
                await this._notifyAllSubscribers("SIGNED_IN", currentSession);
              } else {
                this._debug(debugName, "could not get user data, skipping SIGNED_IN notification");
              }
            } catch (getUserError) {
              console.error("Error getting user data:", getUserError);
              this._debug(debugName, "error getting user data, skipping SIGNED_IN notification", getUserError);
            }
          } else {
            await this._notifyAllSubscribers("SIGNED_IN", currentSession);
          }
        } catch (err) {
          this._debug(debugName, "error", err);
          console.error(err);
          return;
        } finally {
          this._debug(debugName, "end");
        }
      }
      async _callRefreshToken(refreshToken) {
        var _a, _b;
        if (!refreshToken) {
          throw new errors_1.AuthSessionMissingError();
        }
        if (this.refreshingDeferred) {
          return this.refreshingDeferred.promise;
        }
        const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, "begin");
        try {
          this.refreshingDeferred = new helpers_1.Deferred();
          const { data, error } = await this._refreshAccessToken(refreshToken);
          if (error)
            throw error;
          if (!data.session)
            throw new errors_1.AuthSessionMissingError();
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("TOKEN_REFRESHED", data.session);
          const result = { data: data.session, error: null };
          this.refreshingDeferred.resolve(result);
          return result;
        } catch (error) {
          this._debug(debugName, "error", error);
          if ((0, errors_1.isAuthError)(error)) {
            const result = { data: null, error };
            if (!(0, errors_1.isAuthRetryableFetchError)(error)) {
              await this._removeSession();
            }
            (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
            return result;
          }
          (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
          throw error;
        } finally {
          this.refreshingDeferred = null;
          this._debug(debugName, "end");
        }
      }
      async _notifyAllSubscribers(event, session, broadcast = true) {
        const debugName = `#_notifyAllSubscribers(${event})`;
        this._debug(debugName, "begin", session, `broadcast = ${broadcast}`);
        try {
          if (this.broadcastChannel && broadcast) {
            this.broadcastChannel.postMessage({ event, session });
          }
          const errors = [];
          const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
            try {
              await x.callback(event, session);
            } catch (e) {
              errors.push(e);
            }
          });
          await Promise.all(promises);
          if (errors.length > 0) {
            for (let i = 0; i < errors.length; i += 1) {
              console.error(errors[i]);
            }
            throw errors[0];
          }
        } finally {
          this._debug(debugName, "end");
        }
      }
      /**
       * set currentSession and currentUser
       * process to _startAutoRefreshToken if possible
       */
      async _saveSession(session) {
        this._debug("#_saveSession()", session);
        this.suppressGetSessionWarning = true;
        await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`);
        const sessionToProcess = Object.assign({}, session);
        const userIsProxy = sessionToProcess.user && sessionToProcess.user.__isUserNotAvailableProxy === true;
        if (this.userStorage) {
          if (!userIsProxy && sessionToProcess.user) {
            await (0, helpers_1.setItemAsync)(this.userStorage, this.storageKey + "-user", {
              user: sessionToProcess.user
            });
          } else if (userIsProxy) {
          }
          const mainSessionData = Object.assign({}, sessionToProcess);
          delete mainSessionData.user;
          const clonedMainSessionData = (0, helpers_1.deepClone)(mainSessionData);
          await (0, helpers_1.setItemAsync)(this.storage, this.storageKey, clonedMainSessionData);
        } else {
          const clonedSession = (0, helpers_1.deepClone)(sessionToProcess);
          await (0, helpers_1.setItemAsync)(this.storage, this.storageKey, clonedSession);
        }
      }
      async _removeSession() {
        this._debug("#_removeSession()");
        this.suppressGetSessionWarning = false;
        await (0, helpers_1.removeItemAsync)(this.storage, this.storageKey);
        await (0, helpers_1.removeItemAsync)(this.storage, this.storageKey + "-code-verifier");
        await (0, helpers_1.removeItemAsync)(this.storage, this.storageKey + "-user");
        if (this.userStorage) {
          await (0, helpers_1.removeItemAsync)(this.userStorage, this.storageKey + "-user");
        }
        await this._notifyAllSubscribers("SIGNED_OUT", null);
      }
      /**
       * Removes any registered visibilitychange callback.
       *
       * {@see #startAutoRefresh}
       * {@see #stopAutoRefresh}
       */
      _removeVisibilityChangedCallback() {
        this._debug("#_removeVisibilityChangedCallback()");
        const callback = this.visibilityChangedCallback;
        this.visibilityChangedCallback = null;
        try {
          if (callback && (0, helpers_1.isBrowser)() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
            window.removeEventListener("visibilitychange", callback);
          }
        } catch (e) {
          console.error("removing visibilitychange callback failed", e);
        }
      }
      /**
       * This is the private implementation of {@link #startAutoRefresh}. Use this
       * within the library.
       */
      async _startAutoRefresh() {
        await this._stopAutoRefresh();
        this._debug("#_startAutoRefresh()");
        const ticker = setInterval(() => this._autoRefreshTokenTick(), constants_1.AUTO_REFRESH_TICK_DURATION_MS);
        this.autoRefreshTicker = ticker;
        if (ticker && typeof ticker === "object" && typeof ticker.unref === "function") {
          ticker.unref();
        } else if (typeof Deno !== "undefined" && typeof Deno.unrefTimer === "function") {
          Deno.unrefTimer(ticker);
        }
        setTimeout(async () => {
          await this.initializePromise;
          await this._autoRefreshTokenTick();
        }, 0);
      }
      /**
       * This is the private implementation of {@link #stopAutoRefresh}. Use this
       * within the library.
       */
      async _stopAutoRefresh() {
        this._debug("#_stopAutoRefresh()");
        const ticker = this.autoRefreshTicker;
        this.autoRefreshTicker = null;
        if (ticker) {
          clearInterval(ticker);
        }
      }
      /**
       * Starts an auto-refresh process in the background. The session is checked
       * every few seconds. Close to the time of expiration a process is started to
       * refresh the session. If refreshing fails it will be retried for as long as
       * necessary.
       *
       * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
       * to call this function, it will be called for you.
       *
       * On browsers the refresh process works only when the tab/window is in the
       * foreground to conserve resources as well as prevent race conditions and
       * flooding auth with requests. If you call this method any managed
       * visibility change callback will be removed and you must manage visibility
       * changes on your own.
       *
       * On non-browser platforms the refresh process works *continuously* in the
       * background, which may not be desirable. You should hook into your
       * platform's foreground indication mechanism and call these methods
       * appropriately to conserve resources.
       *
       * {@see #stopAutoRefresh}
       */
      async startAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._startAutoRefresh();
      }
      /**
       * Stops an active auto refresh process running in the background (if any).
       *
       * If you call this method any managed visibility change callback will be
       * removed and you must manage visibility changes on your own.
       *
       * See {@link #startAutoRefresh} for more details.
       */
      async stopAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._stopAutoRefresh();
      }
      /**
       * Runs the auto refresh token tick.
       */
      async _autoRefreshTokenTick() {
        this._debug("#_autoRefreshTokenTick()", "begin");
        try {
          await this._acquireLock(0, async () => {
            try {
              const now = Date.now();
              try {
                return await this._useSession(async (result) => {
                  const { data: { session } } = result;
                  if (!session || !session.refresh_token || !session.expires_at) {
                    this._debug("#_autoRefreshTokenTick()", "no session");
                    return;
                  }
                  const expiresInTicks = Math.floor((session.expires_at * 1e3 - now) / constants_1.AUTO_REFRESH_TICK_DURATION_MS);
                  this._debug("#_autoRefreshTokenTick()", `access token expires in ${expiresInTicks} ticks, a tick lasts ${constants_1.AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${constants_1.AUTO_REFRESH_TICK_THRESHOLD} ticks`);
                  if (expiresInTicks <= constants_1.AUTO_REFRESH_TICK_THRESHOLD) {
                    await this._callRefreshToken(session.refresh_token);
                  }
                });
              } catch (e) {
                console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
              }
            } finally {
              this._debug("#_autoRefreshTokenTick()", "end");
            }
          });
        } catch (e) {
          if (e.isAcquireTimeout || e instanceof locks_1.LockAcquireTimeoutError) {
            this._debug("auto refresh token tick lock not available");
          } else {
            throw e;
          }
        }
      }
      /**
       * Registers callbacks on the browser / platform, which in-turn run
       * algorithms when the browser window/tab are in foreground. On non-browser
       * platforms it assumes always foreground.
       */
      async _handleVisibilityChange() {
        this._debug("#_handleVisibilityChange()");
        if (!(0, helpers_1.isBrowser)() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
          if (this.autoRefreshToken) {
            this.startAutoRefresh();
          }
          return false;
        }
        try {
          this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false);
          window === null || window === void 0 ? void 0 : window.addEventListener("visibilitychange", this.visibilityChangedCallback);
          await this._onVisibilityChanged(true);
        } catch (error) {
          console.error("_handleVisibilityChange", error);
        }
      }
      /**
       * Callback registered with `window.addEventListener('visibilitychange')`.
       */
      async _onVisibilityChanged(calledFromInitialize) {
        const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
        this._debug(methodName, "visibilityState", document.visibilityState);
        if (document.visibilityState === "visible") {
          if (this.autoRefreshToken) {
            this._startAutoRefresh();
          }
          if (!calledFromInitialize) {
            await this.initializePromise;
            await this._acquireLock(-1, async () => {
              if (document.visibilityState !== "visible") {
                this._debug(methodName, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
                return;
              }
              await this._recoverAndRefresh();
            });
          }
        } else if (document.visibilityState === "hidden") {
          if (this.autoRefreshToken) {
            this._stopAutoRefresh();
          }
        }
      }
      /**
       * Generates the relevant login URL for a third-party provider.
       * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
       * @param options.scopes A space-separated list of scopes granted to the OAuth application.
       * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
       */
      async _getUrlForProvider(url, provider, options) {
        const urlParams = [`provider=${encodeURIComponent(provider)}`];
        if (options === null || options === void 0 ? void 0 : options.redirectTo) {
          urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
        }
        if (options === null || options === void 0 ? void 0 : options.scopes) {
          urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
        }
        if (this.flowType === "pkce") {
          const [codeChallenge, codeChallengeMethod] = await (0, helpers_1.getCodeChallengeAndMethod)(this.storage, this.storageKey);
          const flowParams = new URLSearchParams({
            code_challenge: `${encodeURIComponent(codeChallenge)}`,
            code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`
          });
          urlParams.push(flowParams.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.queryParams) {
          const query = new URLSearchParams(options.queryParams);
          urlParams.push(query.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
          urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
        }
        return `${url}?${urlParams.join("&")}`;
      }
      async _unenroll(params) {
        try {
          return await this._useSession(async (result) => {
            var _a;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            return await (0, fetch_1._request)(this.fetch, "DELETE", `${this.url}/factors/${params.factorId}`, {
              headers: this.headers,
              jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
            });
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      async _enroll(params) {
        try {
          return await this._useSession(async (result) => {
            var _a, _b;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            const body = Object.assign({ friendly_name: params.friendlyName, factor_type: params.factorType }, params.factorType === "phone" ? { phone: params.phone } : params.factorType === "totp" ? { issuer: params.issuer } : {});
            const { data, error } = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/factors`, {
              body,
              headers: this.headers,
              jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
            });
            if (error) {
              return this._returnResult({ data: null, error });
            }
            if (params.factorType === "totp" && data.type === "totp" && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
              data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
            }
            return this._returnResult({ data, error: null });
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      async _verify(params) {
        return this._acquireLock(-1, async () => {
          try {
            return await this._useSession(async (result) => {
              var _a;
              const { data: sessionData, error: sessionError } = result;
              if (sessionError) {
                return this._returnResult({ data: null, error: sessionError });
              }
              const body = Object.assign({ challenge_id: params.challengeId }, "webauthn" in params ? {
                webauthn: Object.assign(Object.assign({}, params.webauthn), { credential_response: params.webauthn.type === "create" ? (0, webauthn_1.serializeCredentialCreationResponse)(params.webauthn.credential_response) : (0, webauthn_1.serializeCredentialRequestResponse)(params.webauthn.credential_response) })
              } : { code: params.code });
              const { data, error } = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/factors/${params.factorId}/verify`, {
                body,
                headers: this.headers,
                jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
              });
              if (error) {
                return this._returnResult({ data: null, error });
              }
              await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + data.expires_in }, data));
              await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", data);
              return this._returnResult({ data, error });
            });
          } catch (error) {
            if ((0, errors_1.isAuthError)(error)) {
              return this._returnResult({ data: null, error });
            }
            throw error;
          }
        });
      }
      async _challenge(params) {
        return this._acquireLock(-1, async () => {
          try {
            return await this._useSession(async (result) => {
              var _a;
              const { data: sessionData, error: sessionError } = result;
              if (sessionError) {
                return this._returnResult({ data: null, error: sessionError });
              }
              const response = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/factors/${params.factorId}/challenge`, {
                body: params,
                headers: this.headers,
                jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
              });
              if (response.error) {
                return response;
              }
              const { data } = response;
              if (data.type !== "webauthn") {
                return { data, error: null };
              }
              switch (data.webauthn.type) {
                case "create":
                  return {
                    data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: (0, webauthn_1.deserializeCredentialCreationOptions)(data.webauthn.credential_options.publicKey) }) }) }),
                    error: null
                  };
                case "request":
                  return {
                    data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: (0, webauthn_1.deserializeCredentialRequestOptions)(data.webauthn.credential_options.publicKey) }) }) }),
                    error: null
                  };
              }
            });
          } catch (error) {
            if ((0, errors_1.isAuthError)(error)) {
              return this._returnResult({ data: null, error });
            }
            throw error;
          }
        });
      }
      /**
       * {@see GoTrueMFAApi#challengeAndVerify}
       */
      async _challengeAndVerify(params) {
        const { data: challengeData, error: challengeError } = await this._challenge({
          factorId: params.factorId
        });
        if (challengeError) {
          return this._returnResult({ data: null, error: challengeError });
        }
        return await this._verify({
          factorId: params.factorId,
          challengeId: challengeData.id,
          code: params.code
        });
      }
      /**
       * {@see GoTrueMFAApi#listFactors}
       */
      async _listFactors() {
        var _a;
        const { data: { user }, error: userError } = await this.getUser();
        if (userError) {
          return { data: null, error: userError };
        }
        const data = {
          all: [],
          phone: [],
          totp: [],
          webauthn: []
        };
        for (const factor of (_a = user === null || user === void 0 ? void 0 : user.factors) !== null && _a !== void 0 ? _a : []) {
          data.all.push(factor);
          if (factor.status === "verified") {
            ;
            data[factor.factor_type].push(factor);
          }
        }
        return {
          data,
          error: null
        };
      }
      /**
       * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
       */
      async _getAuthenticatorAssuranceLevel() {
        var _a, _b;
        const { data: { session }, error: sessionError } = await this.getSession();
        if (sessionError) {
          return this._returnResult({ data: null, error: sessionError });
        }
        if (!session) {
          return {
            data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
            error: null
          };
        }
        const { payload } = (0, helpers_1.decodeJWT)(session.access_token);
        let currentLevel = null;
        if (payload.aal) {
          currentLevel = payload.aal;
        }
        let nextLevel = currentLevel;
        const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === "verified")) !== null && _b !== void 0 ? _b : [];
        if (verifiedFactors.length > 0) {
          nextLevel = "aal2";
        }
        const currentAuthenticationMethods = payload.amr || [];
        return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
      }
      /**
       * Retrieves details about an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * Returns authorization details including client info, scopes, and user information.
       * If the API returns a redirect_uri, it means consent was already given - the caller
       * should handle the redirect manually if needed.
       */
      async _getAuthorizationDetails(authorizationId) {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new errors_1.AuthSessionMissingError() });
            }
            return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/oauth/authorizations/${authorizationId}`, {
              headers: this.headers,
              jwt: session.access_token,
              xform: (data) => ({ data, error: null })
            });
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Approves an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _approveAuthorization(authorizationId, options) {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new errors_1.AuthSessionMissingError() });
            }
            const response = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
              headers: this.headers,
              jwt: session.access_token,
              body: { action: "approve" },
              xform: (data) => ({ data, error: null })
            });
            if (response.data && response.data.redirect_url) {
              if ((0, helpers_1.isBrowser)() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
                window.location.assign(response.data.redirect_url);
              }
            }
            return response;
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Denies an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _denyAuthorization(authorizationId, options) {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new errors_1.AuthSessionMissingError() });
            }
            const response = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
              headers: this.headers,
              jwt: session.access_token,
              body: { action: "deny" },
              xform: (data) => ({ data, error: null })
            });
            if (response.data && response.data.redirect_url) {
              if ((0, helpers_1.isBrowser)() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
                window.location.assign(response.data.redirect_url);
              }
            }
            return response;
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Lists all OAuth grants that the authenticated user has authorized.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _listOAuthGrants() {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new errors_1.AuthSessionMissingError() });
            }
            return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/user/oauth/grants`, {
              headers: this.headers,
              jwt: session.access_token,
              xform: (data) => ({ data, error: null })
            });
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Revokes a user's OAuth grant for a specific client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _revokeOAuthGrant(options) {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new errors_1.AuthSessionMissingError() });
            }
            await (0, fetch_1._request)(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, {
              headers: this.headers,
              jwt: session.access_token,
              query: { client_id: options.clientId },
              noResolveJson: true
            });
            return { data: {}, error: null };
          });
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      async fetchJwk(kid, jwks = { keys: [] }) {
        let jwk = jwks.keys.find((key) => key.kid === kid);
        if (jwk) {
          return jwk;
        }
        const now = Date.now();
        jwk = this.jwks.keys.find((key) => key.kid === kid);
        if (jwk && this.jwks_cached_at + constants_1.JWKS_TTL > now) {
          return jwk;
        }
        const { data, error } = await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, {
          headers: this.headers
        });
        if (error) {
          throw error;
        }
        if (!data.keys || data.keys.length === 0) {
          return null;
        }
        this.jwks = data;
        this.jwks_cached_at = now;
        jwk = data.keys.find((key) => key.kid === kid);
        if (!jwk) {
          return null;
        }
        return jwk;
      }
      /**
       * Extracts the JWT claims present in the access token by first verifying the
       * JWT against the server's JSON Web Key Set endpoint
       * `/.well-known/jwks.json` which is often cached, resulting in significantly
       * faster responses. Prefer this method over {@link #getUser} which always
       * sends a request to the Auth server for each JWT.
       *
       * If the project is not using an asymmetric JWT signing key (like ECC or
       * RSA) it always sends a request to the Auth server (similar to {@link
       * #getUser}) to verify the JWT.
       *
       * @param jwt An optional specific JWT you wish to verify, not the one you
       *            can obtain from {@link #getSession}.
       * @param options Various additional options that allow you to customize the
       *                behavior of this method.
       */
      async getClaims(jwt, options = {}) {
        try {
          let token = jwt;
          if (!token) {
            const { data, error } = await this.getSession();
            if (error || !data.session) {
              return this._returnResult({ data: null, error });
            }
            token = data.session.access_token;
          }
          const { header, payload, signature, raw: { header: rawHeader, payload: rawPayload } } = (0, helpers_1.decodeJWT)(token);
          if (!(options === null || options === void 0 ? void 0 : options.allowExpired)) {
            (0, helpers_1.validateExp)(payload.exp);
          }
          const signingKey = !header.alg || header.alg.startsWith("HS") || !header.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(header.kid, (options === null || options === void 0 ? void 0 : options.keys) ? { keys: options.keys } : options === null || options === void 0 ? void 0 : options.jwks);
          if (!signingKey) {
            const { error } = await this.getUser(token);
            if (error) {
              throw error;
            }
            return {
              data: {
                claims: payload,
                header,
                signature
              },
              error: null
            };
          }
          const algorithm = (0, helpers_1.getAlgorithm)(header.alg);
          const publicKey = await crypto.subtle.importKey("jwk", signingKey, algorithm, true, [
            "verify"
          ]);
          const isValid2 = await crypto.subtle.verify(algorithm, publicKey, signature, (0, base64url_1.stringToUint8Array)(`${rawHeader}.${rawPayload}`));
          if (!isValid2) {
            throw new errors_1.AuthInvalidJwtError("Invalid JWT signature");
          }
          return {
            data: {
              claims: payload,
              header,
              signature
            },
            error: null
          };
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
    };
    __name(GoTrueClient2, "GoTrueClient");
    GoTrueClient2.nextInstanceID = {};
    exports.default = GoTrueClient2;
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/AuthAdminApi.js
var require_AuthAdminApi = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/AuthAdminApi.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var GoTrueAdminApi_1 = tslib_1.__importDefault(require_GoTrueAdminApi());
    var AuthAdminApi2 = GoTrueAdminApi_1.default;
    exports.default = AuthAdminApi2;
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/AuthClient.js
var require_AuthClient = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/AuthClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var GoTrueClient_1 = tslib_1.__importDefault(require_GoTrueClient());
    var AuthClient2 = GoTrueClient_1.default;
    exports.default = AuthClient2;
  }
});

// node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/index.js
var require_main4 = __commonJS({
  "node_modules/.pnpm/@supabase+auth-js@2.86.2/node_modules/@supabase/auth-js/dist/main/index.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.processLock = exports.lockInternals = exports.NavigatorLockAcquireTimeoutError = exports.navigatorLock = exports.AuthClient = exports.AuthAdminApi = exports.GoTrueClient = exports.GoTrueAdminApi = void 0;
    var tslib_1 = require_tslib();
    var GoTrueAdminApi_1 = tslib_1.__importDefault(require_GoTrueAdminApi());
    exports.GoTrueAdminApi = GoTrueAdminApi_1.default;
    var GoTrueClient_1 = tslib_1.__importDefault(require_GoTrueClient());
    exports.GoTrueClient = GoTrueClient_1.default;
    var AuthAdminApi_1 = tslib_1.__importDefault(require_AuthAdminApi());
    exports.AuthAdminApi = AuthAdminApi_1.default;
    var AuthClient_1 = tslib_1.__importDefault(require_AuthClient());
    exports.AuthClient = AuthClient_1.default;
    tslib_1.__exportStar(require_types3(), exports);
    tslib_1.__exportStar(require_errors3(), exports);
    var locks_1 = require_locks();
    Object.defineProperty(exports, "navigatorLock", { enumerable: true, get: function() {
      return locks_1.navigatorLock;
    } });
    Object.defineProperty(exports, "NavigatorLockAcquireTimeoutError", { enumerable: true, get: function() {
      return locks_1.NavigatorLockAcquireTimeoutError;
    } });
    Object.defineProperty(exports, "lockInternals", { enumerable: true, get: function() {
      return locks_1.internals;
    } });
    Object.defineProperty(exports, "processLock", { enumerable: true, get: function() {
      return locks_1.processLock;
    } });
  }
});

// node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/SupabaseAuthClient.js
var require_SupabaseAuthClient = __commonJS({
  "node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/lib/SupabaseAuthClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupabaseAuthClient = void 0;
    var auth_js_1 = require_main4();
    var SupabaseAuthClient = class extends auth_js_1.AuthClient {
      constructor(options) {
        super(options);
      }
    };
    __name(SupabaseAuthClient, "SupabaseAuthClient");
    exports.SupabaseAuthClient = SupabaseAuthClient;
  }
});

// node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/SupabaseClient.js
var require_SupabaseClient = __commonJS({
  "node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/SupabaseClient.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var functions_js_1 = require_main();
    var postgrest_js_1 = require_cjs();
    var realtime_js_1 = require_main2();
    var storage_js_1 = require_main3();
    var constants_1 = require_constants4();
    var fetch_1 = require_fetch3();
    var helpers_1 = require_helpers3();
    var SupabaseAuthClient_1 = require_SupabaseAuthClient();
    var SupabaseClient2 = class {
      /**
       * Create a new client for use in the browser.
       * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
       * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
       * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
       * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
       * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
       * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
       * @param options.realtime Options passed along to realtime-js constructor.
       * @param options.storage Options passed along to the storage-js constructor.
       * @param options.global.fetch A custom fetch implementation.
       * @param options.global.headers Any additional headers to send with each network request.
       * @example
       * ```ts
       * import { createClient } from '@supabase/supabase-js'
       *
       * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
       * const { data } = await supabase.from('profiles').select('*')
       * ```
       */
      constructor(supabaseUrl, supabaseKey, options) {
        var _a, _b, _c;
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        const baseUrl = (0, helpers_1.validateSupabaseUrl)(supabaseUrl);
        if (!supabaseKey)
          throw new Error("supabaseKey is required.");
        this.realtimeUrl = new URL("realtime/v1", baseUrl);
        this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws");
        this.authUrl = new URL("auth/v1", baseUrl);
        this.storageUrl = new URL("storage/v1", baseUrl);
        this.functionsUrl = new URL("functions/v1", baseUrl);
        const defaultStorageKey = `sb-${baseUrl.hostname.split(".")[0]}-auth-token`;
        const DEFAULTS = {
          db: constants_1.DEFAULT_DB_OPTIONS,
          realtime: constants_1.DEFAULT_REALTIME_OPTIONS,
          auth: Object.assign(Object.assign({}, constants_1.DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
          global: constants_1.DEFAULT_GLOBAL_OPTIONS
        };
        const settings = (0, helpers_1.applySettingDefaults)(options !== null && options !== void 0 ? options : {}, DEFAULTS);
        this.storageKey = (_a = settings.auth.storageKey) !== null && _a !== void 0 ? _a : "";
        this.headers = (_b = settings.global.headers) !== null && _b !== void 0 ? _b : {};
        if (!settings.accessToken) {
          this.auth = this._initSupabaseAuthClient((_c = settings.auth) !== null && _c !== void 0 ? _c : {}, this.headers, settings.global.fetch);
        } else {
          this.accessToken = settings.accessToken;
          this.auth = new Proxy({}, {
            get: (_, prop) => {
              throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
            }
          });
        }
        this.fetch = (0, fetch_1.fetchWithAuth)(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
        this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, settings.realtime));
        if (this.accessToken) {
          this.accessToken().then((token) => this.realtime.setAuth(token)).catch((e) => console.warn("Failed to set initial Realtime auth token:", e));
        }
        this.rest = new postgrest_js_1.PostgrestClient(new URL("rest/v1", baseUrl).href, {
          headers: this.headers,
          schema: settings.db.schema,
          fetch: this.fetch
        });
        this.storage = new storage_js_1.StorageClient(this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
        if (!settings.accessToken) {
          this._listenForAuthEvents();
        }
      }
      /**
       * Supabase Functions allows you to deploy and invoke edge functions.
       */
      get functions() {
        return new functions_js_1.FunctionsClient(this.functionsUrl.href, {
          headers: this.headers,
          customFetch: this.fetch
        });
      }
      /**
       * Perform a query on a table or a view.
       *
       * @param relation - The table or view name to query
       */
      from(relation) {
        return this.rest.from(relation);
      }
      // NOTE: signatures must be kept in sync with PostgrestClient.schema
      /**
       * Select a schema to query or perform an function (rpc) call.
       *
       * The schema needs to be on the list of exposed schemas inside Supabase.
       *
       * @param schema - The schema to query
       */
      schema(schema) {
        return this.rest.schema(schema);
      }
      // NOTE: signatures must be kept in sync with PostgrestClient.rpc
      /**
       * Perform a function call.
       *
       * @param fn - The function name to call
       * @param args - The arguments to pass to the function call
       * @param options - Named parameters
       * @param options.head - When set to `true`, `data` will not be returned.
       * Useful if you only need the count.
       * @param options.get - When set to `true`, the function will be called with
       * read-only access mode.
       * @param options.count - Count algorithm to use to count rows returned by the
       * function. Only applicable for [set-returning
       * functions](https://www.postgresql.org/docs/current/functions-srf.html).
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      rpc(fn, args = {}, options = {
        head: false,
        get: false,
        count: void 0
      }) {
        return this.rest.rpc(fn, args, options);
      }
      /**
       * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
       *
       * @param {string} name - The name of the Realtime channel.
       * @param {Object} opts - The options to pass to the Realtime channel.
       *
       */
      channel(name, opts = { config: {} }) {
        return this.realtime.channel(name, opts);
      }
      /**
       * Returns all Realtime channels.
       */
      getChannels() {
        return this.realtime.getChannels();
      }
      /**
       * Unsubscribes and removes Realtime channel from Realtime client.
       *
       * @param {RealtimeChannel} channel - The name of the Realtime channel.
       *
       */
      removeChannel(channel) {
        return this.realtime.removeChannel(channel);
      }
      /**
       * Unsubscribes and removes all Realtime channels from Realtime client.
       */
      removeAllChannels() {
        return this.realtime.removeAllChannels();
      }
      async _getAccessToken() {
        var _a, _b;
        if (this.accessToken) {
          return await this.accessToken();
        }
        const { data } = await this.auth.getSession();
        return (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : this.supabaseKey;
      }
      _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, userStorage, storageKey, flowType, lock, debug, throwOnError }, headers, fetch2) {
        const authHeaders = {
          Authorization: `Bearer ${this.supabaseKey}`,
          apikey: `${this.supabaseKey}`
        };
        return new SupabaseAuthClient_1.SupabaseAuthClient({
          url: this.authUrl.href,
          headers: Object.assign(Object.assign({}, authHeaders), headers),
          storageKey,
          autoRefreshToken,
          persistSession,
          detectSessionInUrl,
          storage,
          userStorage,
          flowType,
          lock,
          debug,
          throwOnError,
          fetch: fetch2,
          // auth checks if there is a custom authorizaiton header using this flag
          // so it knows whether to return an error when getUser is called with no session
          hasCustomAuthorizationHeader: Object.keys(this.headers).some((key) => key.toLowerCase() === "authorization")
        });
      }
      _initRealtimeClient(options) {
        return new realtime_js_1.RealtimeClient(this.realtimeUrl.href, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
      }
      _listenForAuthEvents() {
        const data = this.auth.onAuthStateChange((event, session) => {
          this._handleTokenChanged(event, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
        });
        return data;
      }
      _handleTokenChanged(event, source, token) {
        if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && this.changedAccessToken !== token) {
          this.changedAccessToken = token;
          this.realtime.setAuth(token);
        } else if (event === "SIGNED_OUT") {
          this.realtime.setAuth();
          if (source == "STORAGE")
            this.auth.signOut();
          this.changedAccessToken = void 0;
        }
      }
    };
    __name(SupabaseClient2, "SupabaseClient");
    exports.default = SupabaseClient2;
  }
});

// node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/index.js
var require_main5 = __commonJS({
  "node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/main/index.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createClient = exports.SupabaseClient = exports.FunctionRegion = exports.FunctionsError = exports.FunctionsRelayError = exports.FunctionsFetchError = exports.FunctionsHttpError = exports.PostgrestError = void 0;
    var SupabaseClient_1 = __importDefault(require_SupabaseClient());
    __exportStar(require_main4(), exports);
    var postgrest_js_1 = require_cjs();
    Object.defineProperty(exports, "PostgrestError", { enumerable: true, get: function() {
      return postgrest_js_1.PostgrestError;
    } });
    var functions_js_1 = require_main();
    Object.defineProperty(exports, "FunctionsHttpError", { enumerable: true, get: function() {
      return functions_js_1.FunctionsHttpError;
    } });
    Object.defineProperty(exports, "FunctionsFetchError", { enumerable: true, get: function() {
      return functions_js_1.FunctionsFetchError;
    } });
    Object.defineProperty(exports, "FunctionsRelayError", { enumerable: true, get: function() {
      return functions_js_1.FunctionsRelayError;
    } });
    Object.defineProperty(exports, "FunctionsError", { enumerable: true, get: function() {
      return functions_js_1.FunctionsError;
    } });
    Object.defineProperty(exports, "FunctionRegion", { enumerable: true, get: function() {
      return functions_js_1.FunctionRegion;
    } });
    __exportStar(require_main2(), exports);
    var SupabaseClient_2 = require_SupabaseClient();
    Object.defineProperty(exports, "SupabaseClient", { enumerable: true, get: function() {
      return __importDefault(SupabaseClient_2).default;
    } });
    var createClient2 = /* @__PURE__ */ __name((supabaseUrl, supabaseKey, options) => {
      return new SupabaseClient_1.default(supabaseUrl, supabaseKey, options);
    }, "createClient");
    exports.createClient = createClient2;
    function shouldShowDeprecationWarning() {
      if (typeof window !== "undefined") {
        return false;
      }
      if (typeof process === "undefined") {
        return false;
      }
      const processVersion = process["version"];
      if (processVersion === void 0 || processVersion === null) {
        return false;
      }
      const versionMatch = processVersion.match(/^v(\d+)\./);
      if (!versionMatch) {
        return false;
      }
      const majorVersion = parseInt(versionMatch[1], 10);
      return majorVersion <= 18;
    }
    __name(shouldShowDeprecationWarning, "shouldShowDeprecationWarning");
    if (shouldShowDeprecationWarning()) {
      console.warn(`\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217`);
    }
  }
});

// .wrangler/tmp/bundle-YRAKNw/middleware-loader.entry.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/bundle-YRAKNw/middleware-insertion-facade.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/index.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/hono.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/hono-base.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/compose.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index2 = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index2) {
        throw new Error("next() called multiple times");
      }
      index2 = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/context.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/request.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/http-exception.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var HTTPException = /* @__PURE__ */ __name(class extends Error {
  res;
  status;
  constructor(status = 500, options) {
    super(options?.message, { cause: options?.cause });
    this.res = options?.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      const newResponse = new Response(this.res.body, {
        status: this.status,
        headers: this.res.headers
      });
      return newResponse;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
}, "HTTPException");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/request/constants.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var GET_MATCH_RESULT = Symbol();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/utils/body.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index2) => {
    if (index2 === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/utils/url.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index2) => {
    const mark = `@${index2}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/utils/html.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/utils/constants.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "Hono");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/reg-exp-router/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/reg-exp-router/router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/reg-exp-router/matcher.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index2 = match3.indexOf("", 1);
    return [matcher[1][index2], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/reg-exp-router/node.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index2, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index2;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index2, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "Node");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/reg-exp-router/trie.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index2, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index2, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/smart-router/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/smart-router/router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/trie-router/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/trie-router/router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/trie-router/node.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "Node");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/middleware/cors/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  __name(assertIs, "assertIs");
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  __name(assertNever, "assertNever");
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  __name(joinValues, "joinValues");
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = /* @__PURE__ */ __name((data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
}, "getParsedType");

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = /* @__PURE__ */ __name((obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
}, "quotelessJson");
var ZodError = class extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = /* @__PURE__ */ __name((error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }, "processError");
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
__name(ZodError, "ZodError");
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap = /* @__PURE__ */ __name((issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
}, "errorMap");
var en_default = errorMap;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
__name(setErrorMap, "setErrorMap");
function getErrorMap() {
  return overrideErrorMap;
}
__name(getErrorMap, "getErrorMap");

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var makeIssue = /* @__PURE__ */ __name((params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
}, "makeIssue");
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
__name(addIssueToContext, "addIssueToContext");
var ParseStatus = class {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
__name(ParseStatus, "ParseStatus");
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = /* @__PURE__ */ __name((value) => ({ status: "dirty", value }), "DIRTY");
var OK = /* @__PURE__ */ __name((value) => ({ status: "valid", value }), "OK");
var isAborted = /* @__PURE__ */ __name((x) => x.status === "aborted", "isAborted");
var isDirty = /* @__PURE__ */ __name((x) => x.status === "dirty", "isDirty");
var isValid = /* @__PURE__ */ __name((x) => x.status === "valid", "isValid");
var isAsync = /* @__PURE__ */ __name((x) => typeof Promise !== "undefined" && x instanceof Promise, "isAsync");

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
__name(ParseInputLazyPath, "ParseInputLazyPath");
var handleResult = /* @__PURE__ */ __name((ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
}, "handleResult");
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = /* @__PURE__ */ __name((iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  }, "customMap");
  return { errorMap: customMap, description };
}
__name(processCreateParams, "processCreateParams");
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = /* @__PURE__ */ __name((val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    }, "getIssueProperties");
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = /* @__PURE__ */ __name(() => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      }), "setError");
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
__name(ZodType, "ZodType");
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
__name(timeRegexSource, "timeRegexSource");
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
__name(timeRegex, "timeRegex");
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
__name(datetimeRegex, "datetimeRegex");
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
__name(isValidIP, "isValidIP");
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
__name(isValidJWT, "isValidJWT");
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
__name(isValidCidr, "isValidCidr");
var ZodString = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
__name(ZodString, "ZodString");
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
__name(floatSafeRemainder, "floatSafeRemainder");
var ZodNumber = class extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
__name(ZodNumber, "ZodNumber");
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
__name(ZodBigInt, "ZodBigInt");
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(ZodBoolean, "ZodBoolean");
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
__name(ZodDate, "ZodDate");
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(ZodSymbol, "ZodSymbol");
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(ZodUndefined, "ZodUndefined");
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(ZodNull, "ZodNull");
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
__name(ZodAny, "ZodAny");
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
__name(ZodUnknown, "ZodUnknown");
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
__name(ZodNever, "ZodNever");
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
__name(ZodVoid, "ZodVoid");
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
__name(ZodArray, "ZodArray");
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
__name(deepPartialify, "deepPartialify");
var ZodObject = class extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index2) {
    return new ZodObject({
      ...this._def,
      catchall: index2
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
__name(ZodObject, "ZodObject");
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    __name(handleResults, "handleResults");
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
__name(ZodUnion, "ZodUnion");
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = /* @__PURE__ */ __name((type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
}, "getDiscriminator");
var ZodDiscriminatedUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
__name(ZodDiscriminatedUnion, "ZodDiscriminatedUnion");
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index2 = 0; index2 < a.length; index2++) {
      const itemA = a[index2];
      const itemB = b[index2];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
__name(mergeValues, "mergeValues");
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = /* @__PURE__ */ __name((parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    }, "handleParsed");
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
__name(ZodIntersection, "ZodIntersection");
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
};
__name(ZodTuple, "ZodTuple");
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
__name(ZodRecord, "ZodRecord");
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index2) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index2, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index2, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
__name(ZodMap, "ZodMap");
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    __name(finalizeSet, "finalizeSet");
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
__name(ZodSet, "ZodSet");
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    __name(makeArgsIssue, "makeArgsIssue");
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    __name(makeReturnsIssue, "makeReturnsIssue");
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
__name(ZodFunction, "ZodFunction");
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
__name(ZodLazy, "ZodLazy");
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
__name(ZodLiteral, "ZodLiteral");
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
__name(createZodEnum, "createZodEnum");
var ZodEnum = class extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
__name(ZodEnum, "ZodEnum");
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
__name(ZodNativeEnum, "ZodNativeEnum");
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
__name(ZodPromise, "ZodPromise");
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = /* @__PURE__ */ __name((acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      }, "executeRefinement");
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
__name(ZodEffects, "ZodEffects");
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
__name(ZodOptional, "ZodOptional");
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
__name(ZodNullable, "ZodNullable");
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
__name(ZodDefault, "ZodDefault");
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
__name(ZodCatch, "ZodCatch");
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
__name(ZodNaN, "ZodNaN");
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
__name(ZodBranded, "ZodBranded");
var ZodPipeline = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = /* @__PURE__ */ __name(async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      }, "handleAsync");
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
__name(ZodPipeline, "ZodPipeline");
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = /* @__PURE__ */ __name((data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    }, "freeze");
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
__name(ZodReadonly, "ZodReadonly");
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
__name(cleanParams, "cleanParams");
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
__name(custom, "custom");
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = /* @__PURE__ */ __name((cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params), "instanceOfType");
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = /* @__PURE__ */ __name(() => stringType().optional(), "ostring");
var onumber = /* @__PURE__ */ __name(() => numberType().optional(), "onumber");
var oboolean = /* @__PURE__ */ __name(() => booleanType().optional(), "oboolean");
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;

// node_modules/.pnpm/@hono+zod-validator@0.2.2_hono@4.10.7_zod@3.25.76/node_modules/@hono/zod-validator/dist/esm/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/validator/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/validator/validator.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/helper/cookie/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/utils/cookie.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = /* @__PURE__ */ __name((cookie, name) => {
  if (name && cookie.indexOf(name) === -1) {
    return {};
  }
  const pairs = cookie.trim().split(";");
  const parsedCookie = {};
  for (let pairStr of pairs) {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      continue;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      continue;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = cookieValue.indexOf("%") !== -1 ? tryDecode(cookieValue, decodeURIComponent_) : cookieValue;
      if (name) {
        break;
      }
    }
  }
  return parsedCookie;
}, "parse");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/helper/cookie/index.js
var getCookie = /* @__PURE__ */ __name((c, key, prefix) => {
  const cookie = c.req.raw.headers.get("Cookie");
  if (typeof key === "string") {
    if (!cookie) {
      return void 0;
    }
    let finalKey = key;
    if (prefix === "secure") {
      finalKey = "__Secure-" + key;
    } else if (prefix === "host") {
      finalKey = "__Host-" + key;
    }
    const obj2 = parse(cookie, finalKey);
    return obj2[finalKey];
  }
  if (!cookie) {
    return {};
  }
  const obj = parse(cookie);
  return obj;
}, "getCookie");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/utils/buffer.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/utils/crypto.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      "Content-Type": contentType
    }
  });
  return response.formData();
}, "bufferToFormData");

// node_modules/.pnpm/hono@4.10.7/node_modules/hono/dist/validator/validator.js
var jsonRegex = /^application\/([a-z-\.]+\+)?json(;\s*[a-zA-Z0-9\-]+\=([^;]+))*$/;
var multipartRegex = /^multipart\/form-data(;\s?boundary=[a-zA-Z0-9'"()+_,\-./:=?]+)?$/;
var urlencodedRegex = /^application\/x-www-form-urlencoded(;\s*[a-zA-Z0-9\-]+\=([^;]+))*$/;
var validator = /* @__PURE__ */ __name((target, validationFunc) => {
  return async (c, next) => {
    let value = {};
    const contentType = c.req.header("Content-Type");
    switch (target) {
      case "json":
        if (!contentType || !jsonRegex.test(contentType)) {
          break;
        }
        try {
          value = await c.req.json();
        } catch {
          const message = "Malformed JSON in request body";
          throw new HTTPException(400, { message });
        }
        break;
      case "form": {
        if (!contentType || !(multipartRegex.test(contentType) || urlencodedRegex.test(contentType))) {
          break;
        }
        let formData;
        if (c.req.bodyCache.formData) {
          formData = await c.req.bodyCache.formData;
        } else {
          try {
            const arrayBuffer = await c.req.arrayBuffer();
            formData = await bufferToFormData(arrayBuffer, contentType);
            c.req.bodyCache.formData = formData;
          } catch (e) {
            let message = "Malformed FormData request.";
            message += e instanceof Error ? ` ${e.message}` : ` ${String(e)}`;
            throw new HTTPException(400, { message });
          }
        }
        const form = {};
        formData.forEach((value2, key) => {
          if (key.endsWith("[]")) {
            ;
            (form[key] ??= []).push(value2);
          } else if (Array.isArray(form[key])) {
            ;
            form[key].push(value2);
          } else if (key in form) {
            form[key] = [form[key], value2];
          } else {
            form[key] = value2;
          }
        });
        value = form;
        break;
      }
      case "query":
        value = Object.fromEntries(
          Object.entries(c.req.queries()).map(([k, v]) => {
            return v.length === 1 ? [k, v[0]] : [k, v];
          })
        );
        break;
      case "param":
        value = c.req.param();
        break;
      case "header":
        value = c.req.header();
        break;
      case "cookie":
        value = getCookie(c);
        break;
    }
    const res = await validationFunc(value, c);
    if (res instanceof Response) {
      return res;
    }
    c.req.addValidatedData(target, res);
    return await next();
  };
}, "validator");

// node_modules/.pnpm/@hono+zod-validator@0.2.2_hono@4.10.7_zod@3.25.76/node_modules/@hono/zod-validator/dist/esm/index.js
var zValidator = /* @__PURE__ */ __name((target, schema, hook) => (
  // @ts-expect-error not typed well
  validator(target, async (value, c) => {
    const result = await schema.safeParseAsync(value);
    if (hook) {
      const hookResult = await hook({ data: value, ...result }, c);
      if (hookResult) {
        if (hookResult instanceof Response) {
          return hookResult;
        }
        if ("response" in hookResult) {
          return hookResult.response;
        }
      }
    }
    if (!result.success) {
      return c.json(result, 400);
    }
    return result.data;
  })
), "zValidator");

// src/utils/etag.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
async function sha256Hex(input) {
  const enc = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
async function makeWeakEtag(body) {
  const hex = await sha256Hex(body);
  return `W/"${hex}"`;
}
__name(makeWeakEtag, "makeWeakEtag");

// src/supabase.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/.pnpm/@supabase+supabase-js@2.86.2/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var index = __toESM(require_main5(), 1);
var {
  PostgrestError,
  FunctionsHttpError,
  FunctionsFetchError,
  FunctionsRelayError,
  FunctionsError,
  FunctionRegion,
  SupabaseClient,
  createClient,
  GoTrueAdminApi,
  GoTrueClient,
  AuthAdminApi,
  AuthClient,
  navigatorLock,
  NavigatorLockAcquireTimeoutError,
  lockInternals,
  processLock,
  SIGN_OUT_SCOPES,
  AuthError,
  AuthApiError,
  AuthUnknownError,
  CustomAuthError,
  AuthSessionMissingError,
  AuthInvalidTokenResponseError,
  AuthInvalidCredentialsError,
  AuthImplicitGrantRedirectError,
  AuthPKCEGrantCodeExchangeError,
  AuthRetryableFetchError,
  AuthWeakPasswordError,
  AuthInvalidJwtError,
  isAuthError,
  isAuthApiError,
  isAuthSessionMissingError,
  isAuthImplicitGrantRedirectError,
  isAuthRetryableFetchError,
  isAuthWeakPasswordError,
  RealtimePresence,
  RealtimeChannel,
  RealtimeClient,
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  REALTIME_SUBSCRIBE_STATES,
  REALTIME_CHANNEL_STATES
} = index.default || index;

// src/supabase.ts
function getSupabase(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL/SUPABASE_ANON_KEY is not set");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
__name(getSupabase, "getSupabase");

// src/index.ts
var app = new Hono2();
app.use("*", (c, next) => {
  return cors({
    origin: "*",
    allowHeaders: ["Content-Type", "If-None-Match", "Authorization", "X-Internal-Key"],
    allowMethods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"],
    exposeHeaders: ["ETag"],
    maxAge: 600
  })(c, next);
});
async function cacheJson(c, key, getPayload) {
  const cache = caches.default;
  const req = new Request(new URL(key, "http://dummy").toString());
  const ifNoneMatch = c.req.header("If-None-Match");
  const matched = await cache.match(req);
  if (matched) {
    const etag = matched.headers.get("ETag");
    if (etag && ifNoneMatch && etag === ifNoneMatch) {
      return new Response(null, { status: 304, headers: { "ETag": etag } });
    }
    return matched;
  }
  const res = await getPayload();
  if (res.ok) {
    const buf = await res.clone().arrayBuffer();
    const etag = await makeWeakEtag(buf);
    const withHeaders = new Response(buf, {
      status: res.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "ETag": etag
      }
    });
    await cache.put(req, withHeaders.clone());
    if (ifNoneMatch && etag === ifNoneMatch) {
      return new Response(null, { status: 304, headers: { "ETag": etag } });
    }
    return withHeaders;
  }
  return res;
}
__name(cacheJson, "cacheJson");
var listQuery = external_exports.object({
  shallow: external_exports.union([external_exports.literal("true"), external_exports.literal("false")]).optional(),
  published: external_exports.union([external_exports.literal("true"), external_exports.literal("false")]).optional(),
  limit: external_exports.string().regex(/^\d+$/).optional(),
  offset: external_exports.string().regex(/^\d+$/).optional(),
  count: external_exports.union([external_exports.literal("true"), external_exports.literal("false")]).optional(),
  tag: external_exports.string().optional(),
  id: external_exports.string().optional(),
  slug: external_exports.string().optional()
});
function upstream(c, path) {
  const base = (c.env.INTERNAL_API_BASE || "").replace(/\/$/, "");
  if (!base)
    return null;
  const url = new URL(base + path);
  const qs = c.req.query();
  for (const [k, v] of Object.entries(qs)) {
    if (typeof v === "string")
      url.searchParams.set(k, v);
  }
  return url.toString();
}
__name(upstream, "upstream");
app.get("/collections", zValidator("query", listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env);
  const q = c.req.query();
  const limit = q.limit ? Math.max(0, parseInt(q.limit)) : null;
  const offset = q.offset ? Math.max(0, parseInt(q.offset)) : 0;
  const wantCount = q.count === "true";
  const key = `collections${c.req.url.includes("?") ? c.req.url.substring(c.req.url.indexOf("?")) : ""}`;
  return cacheJson(c, key, async () => {
    try {
      let collections = [];
      let total = null;
      if (limit && limit > 0) {
        if (wantCount) {
          const res = await supabase.from("collections").select("*", { count: "exact" }).eq("visibility", "public").order("created_at", { ascending: false }).range(offset, offset + Math.max(0, limit - 1));
          collections = res.data || [];
          total = typeof res.count === "number" ? res.count : null;
        } else {
          const res = await supabase.from("collections").select("*").eq("visibility", "public").order("created_at", { ascending: false }).range(offset, offset + Math.max(0, limit - 1));
          collections = res.data || [];
        }
      } else {
        const res = await supabase.from("collections").select("*").eq("visibility", "public").order("created_at", { ascending: false });
        collections = res.data || [];
      }
      if (!collections || collections.length === 0)
        return new Response(JSON.stringify({ data: [], meta: total != null ? { total, limit, offset } : void 0 }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
      const collectionIds = collections.map((c2) => c2.id);
      const { data: items = [] } = await supabase.from("collection_items").select("*").in("collection_id", collectionIds);
      const productIds = Array.from(new Set((items || []).map((it) => it.product_id)));
      let products = [];
      if (productIds.length > 0) {
        const ownerId = (c.env.PUBLIC_OWNER_USER_ID || "").trim();
        const shallowSelect = "id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,images:product_images(id,product_id,url,width,height,role)";
        const baseSelect = "*, images:product_images(*), affiliateLinks:affiliate_links(*)";
        let prodQuery = supabase.from("products").select(shallowSelect).in("id", productIds).eq("published", true);
        if (ownerId)
          prodQuery = prodQuery.eq("user_id", ownerId);
        const { data: prods = [] } = await prodQuery;
        products = prods;
      }
      const productMap = /* @__PURE__ */ new Map();
      for (const p of products)
        productMap.set(p.id, p);
      const transformed = collections.map((col) => {
        const thisItems = (items || []).filter((it) => it.collection_id === col.id);
        const thisProducts = thisItems.map((it) => productMap.get(it.product_id)).filter(Boolean);
        return {
          id: col.id,
          userId: col.user_id,
          title: col.title,
          description: col.description,
          visibility: col.visibility,
          createdAt: col.created_at,
          updatedAt: col.updated_at,
          products: thisProducts.map((p) => ({
            id: p.id,
            userId: p.user_id,
            title: p.title,
            slug: p.slug,
            shortDescription: p.short_description,
            body: p.body,
            tags: p.tags,
            price: p.price,
            published: p.published,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            showPrice: p.show_price,
            notes: p.notes,
            relatedLinks: p.related_links,
            images: Array.isArray(p.images) ? p.images.map((img) => ({ id: img.id, productId: img.product_id, url: img.url, width: img.width, height: img.height, aspect: img.aspect, role: img.role })) : [],
            affiliateLinks: Array.isArray(p.affiliateLinks) ? p.affiliateLinks.map((l) => ({ provider: l.provider, url: l.url, label: l.label })) : []
          }))
        };
      });
      const meta = total != null ? { total, limit, offset } : void 0;
      return new Response(JSON.stringify({ data: transformed, meta }), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
    }
  });
});
app.get("/profile", zValidator("query", listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env);
  const key = `profile`;
  return cacheJson(c, key, async () => {
    try {
      const ownerEmail = (c.env.PUBLIC_PROFILE_EMAIL || "").toString() || "";
      if (!ownerEmail)
        return new Response(JSON.stringify({ data: null }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
      const { data, error } = await supabase.from("users").select("*").eq("email", ownerEmail).limit(1);
      if (error)
        return new Response(JSON.stringify({ data: null }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
      const user = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (!user)
        return new Response(JSON.stringify({ data: null }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
      const transformed = {
        id: user.id,
        name: user.name || null,
        displayName: user.display_name || user.displayName || user.name || null,
        email: user.email || null,
        avatarUrl: user.avatar_url || user.profile_image || null,
        profileImage: user.profile_image || null,
        profileImageKey: user.profile_image_key || null,
        headerImage: user.header_image || null,
        headerImages: user.header_image_keys || null,
        headerImageKey: user.header_image_key || null,
        headerImageKeys: user.header_image_keys || null,
        bio: user.bio || null,
        socialLinks: user.social_links || null
      };
      return new Response(JSON.stringify({ data: transformed }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
    }
  });
});
app.get("/recipes", zValidator("query", listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env);
  const key = `recipes${c.req.url.includes("?") ? c.req.url.substring(c.req.url.indexOf("?")) : ""}`;
  return cacheJson(c, key, async () => {
    try {
      const ownerId = (c.env.PUBLIC_OWNER_USER_ID || "").trim();
      let recipesQuery = supabase.from("recipes").select("*").order("created_at", { ascending: false });
      if (ownerId)
        recipesQuery = recipesQuery.eq("user_id", ownerId);
      else
        recipesQuery = recipesQuery.eq("published", true);
      const { data: recipes = [], error: recipesErr } = await recipesQuery;
      if (recipesErr)
        return new Response(JSON.stringify({ error: recipesErr.message }), { status: 500 });
      const recipeIds = recipes.map((r) => r.id);
      const { data: pins = [] } = await supabase.from("recipe_pins").select("*").in("recipe_id", recipeIds);
      const pinsByRecipe = /* @__PURE__ */ new Map();
      for (const p of pins || []) {
        const mapped = {
          id: p.id,
          recipeId: p.recipe_id,
          productId: p.product_id,
          userId: p.user_id,
          tagDisplayText: p.tag_display_text ?? p.tag_text ?? null,
          dotXPercent: Number(p.dot_x_percent ?? p.dot_x ?? 0),
          dotYPercent: Number(p.dot_y_percent ?? p.dot_y ?? 0),
          tagXPercent: Number(p.tag_x_percent ?? p.tag_x ?? 0),
          tagYPercent: Number(p.tag_y_percent ?? p.tag_y ?? 0),
          dotSizePercent: Number(p.dot_size_percent ?? p.dot_size ?? 0),
          tagFontSizePercent: Number(p.tag_font_size_percent ?? p.tag_font_size ?? 0),
          lineWidthPercent: Number(p.line_width_percent ?? p.line_width ?? 0),
          tagPaddingXPercent: Number(p.tag_padding_x_percent ?? p.tag_padding_x ?? 0),
          tagPaddingYPercent: Number(p.tag_padding_y_percent ?? p.tag_padding_y ?? 0),
          tagBorderRadiusPercent: Number(p.tag_border_radius_percent ?? p.tag_border_radius ?? 0),
          tagBorderWidthPercent: Number(p.tag_border_width_percent ?? p.tag_border_width ?? 0),
          dotColor: p.dot_color ?? null,
          dotShape: p.dot_shape ?? null,
          tagText: p.tag_text ?? null,
          tagFontFamily: p.tag_font_family ?? null,
          tagFontWeight: p.tag_font_weight ?? null,
          tagTextColor: p.tag_text_color ?? null,
          tagTextShadow: p.tag_text_shadow ?? null,
          tagBackgroundColor: p.tag_background_color ?? null,
          tagBackgroundOpacity: Number(p.tag_background_opacity ?? 0),
          tagBorderColor: p.tag_border_color ?? null,
          tagShadow: p.tag_shadow ?? null,
          lineType: p.line_type ?? null,
          lineColor: p.line_color ?? null,
          createdAt: p.created_at || null,
          updatedAt: p.updated_at || null
        };
        const arr = pinsByRecipe.get(mapped.recipeId) || [];
        arr.push(mapped);
        pinsByRecipe.set(mapped.recipeId, arr);
      }
      const transformed = (recipes || []).map((r) => {
        const imgsRaw = Array.isArray(r.images) ? r.images : [];
        const mappedImages = imgsRaw.map((img) => ({ id: img.id, recipeId: r.id, url: img.url, width: img.width, height: img.height }));
        if (r.base_image_id && mappedImages.length > 1) {
          const idx = mappedImages.findIndex((mi) => mi.id === r.base_image_id);
          if (idx > 0) {
            const [base] = mappedImages.splice(idx, 1);
            mappedImages.unshift(base);
          }
        }
        const mappedPins = pinsByRecipe.get(r.id) || [];
        return {
          id: r.id,
          userId: r.user_id,
          title: r.title,
          published: !!r.published,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          images: mappedImages,
          imageDataUrl: r.image_data_url || (mappedImages.length > 0 ? mappedImages[0].url : null) || null,
          pins: mappedPins
        };
      });
      return new Response(JSON.stringify({ data: transformed }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
    }
  });
});
app.get("/tag-groups", zValidator("query", listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env);
  const key = `tag-groups`;
  return cacheJson(c, key, async () => {
    try {
      const ownerId = (c.env.PUBLIC_OWNER_USER_ID || "").trim();
      if (ownerId) {
        const res2 = await supabase.from("tag_groups").select("name, label, sort_order, created_at").eq("user_id", ownerId).order("sort_order", { ascending: true, nullsFirst: false }).order("created_at", { ascending: true });
        if (res2.error) {
          const fallback = await supabase.from("tag_groups").select("name, label, sort_order, created_at").order("sort_order", { ascending: true, nullsFirst: false }).order("created_at", { ascending: true });
          if (fallback.error)
            return new Response(JSON.stringify({ data: [] }));
          return new Response(JSON.stringify({ data: fallback.data || [] }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
        }
        return new Response(JSON.stringify({ data: res2.data || [] }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
      }
      const res = await supabase.from("tag_groups").select("name, label, sort_order, created_at").order("sort_order", { ascending: true, nullsFirst: false }).order("created_at", { ascending: true });
      if (res.error)
        return new Response(JSON.stringify({ data: [] }));
      return new Response(JSON.stringify({ data: res.data || [] }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (e) {
      return new Response(JSON.stringify({ data: [] }));
    }
  });
});
app.get("/tags", zValidator("query", listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env);
  const key = `tags`;
  return cacheJson(c, key, async () => {
    try {
      const res = await supabase.from("tags").select("id, name, group, link_url, link_label, user_id, sort_order, created_at").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      if (res.error)
        return new Response(JSON.stringify({ data: [] }));
      const mapped = (res.data || []).map((row) => ({ id: row.id, name: row.name, group: row.group ?? void 0, linkUrl: row.link_url ?? void 0, linkLabel: row.link_label ?? void 0, userId: row.user_id ?? void 0, sortOrder: row.sort_order ?? 0, createdAt: row.created_at }));
      return new Response(JSON.stringify({ data: mapped }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (e) {
      return new Response(JSON.stringify({ data: [] }));
    }
  });
});
app.get("/amazon-sale-schedules", async (c) => {
  const supabase = getSupabase(c.env);
  const key = `amazon-sale-schedules`;
  return cacheJson(c, key, async () => {
    try {
      const ownerId = (c.env.PUBLIC_OWNER_USER_ID || "").trim();
      let query = supabase.from("amazon_sale_schedules").select("*").order("start_date", { ascending: true });
      if (ownerId)
        query = query.eq("user_id", ownerId);
      const { data = [], error } = await query;
      if (error)
        return new Response(JSON.stringify({ data: [] }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
      const mapped = (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        saleName: row.sale_name,
        startDate: row.start_date,
        endDate: row.end_date,
        collectionId: row.collection_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      return new Response(JSON.stringify({ data: mapped }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (e) {
      return new Response(JSON.stringify({ data: [] }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    }
  });
});
app.get("/site-settings", async (c) => {
  const supabase = getSupabase(c.env);
  const upstreamUrl = upstream(c, "/api/site-settings");
  const key = `site-settings`;
  return cacheJson(c, key, async () => {
    try {
      if (upstreamUrl) {
        const res = await fetch(upstreamUrl, { method: "GET" });
        if (!res.ok)
          return new Response(JSON.stringify({ data: {} }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
        const json = await res.json().catch(() => ({ data: {} }));
        return new Response(JSON.stringify(json), { headers: { "Content-Type": "application/json; charset=utf-8" } });
      }
      const { data, error } = await supabase.from("site_settings").select("key, value").limit(100);
      if (error)
        return new Response(JSON.stringify({ data: {} }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
      const rows = Array.isArray(data) ? data : [];
      const out = {};
      for (const r of rows) {
        try {
          if (r && typeof r.key === "string")
            out[r.key] = r.value;
        } catch {
        }
      }
      return new Response(JSON.stringify({ data: out }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (e) {
      return new Response(JSON.stringify({ data: {} }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    }
  });
});
function deriveBasePathFromUrl(urlOrKey, env) {
  if (!urlOrKey)
    return null;
  try {
    const pub = (env?.R2_PUBLIC_URL || "").replace(/\/$/, "");
    const bucket = (env?.R2_BUCKET || "").replace(/^\/+|\/+$/g, "");
    let key = urlOrKey;
    if (/^https?:\/\//i.test(urlOrKey)) {
      const u = new URL(urlOrKey);
      key = u.pathname.replace(/^\/+/, "");
    }
    if (bucket && key.startsWith(`${bucket}/`))
      key = key.slice(bucket.length + 1);
    key = key.replace(/^images\//, "");
    const parts = key.split("/");
    parts.pop();
    return parts.join("/") || null;
  } catch {
    return null;
  }
}
__name(deriveBasePathFromUrl, "deriveBasePathFromUrl");
app.get("/products", zValidator("query", listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env);
  const q = c.req.query();
  const shallow = q.shallow === "true";
  const published = q.published === "true";
  const limit = q.limit ? Math.max(0, parseInt(q.limit)) : null;
  const offset = q.offset ? Math.max(0, parseInt(q.offset)) : 0;
  const wantCount = q.count === "true";
  const id = q.id;
  const slug = q.slug;
  const tag = q.tag;
  const baseSelect = "*, images:product_images(*), affiliateLinks:affiliate_links(*)";
  const shallowSelect = "id,user_id,title,slug,tags,price,published,created_at,updated_at,images:product_images(id,product_id,url,width,height,role)";
  const key = `products${c.req.url.includes("?") ? c.req.url.substring(c.req.url.indexOf("?")) : ""}`;
  return cacheJson(c, key, async () => {
    try {
      let query = supabase.from("products").select(shallow ? shallowSelect : baseSelect);
      if (id)
        query = supabase.from("products").select(shallow ? shallowSelect : baseSelect).eq("id", id);
      else if (slug)
        query = supabase.from("products").select(shallow ? shallowSelect : baseSelect).eq("slug", slug);
      else if (tag)
        query = supabase.from("products").select(shallow ? shallowSelect : baseSelect).contains("tags", [tag]);
      else if (published)
        query = supabase.from("products").select(shallow ? shallowSelect : baseSelect).eq("published", true);
      const ownerId = (c.env.PUBLIC_OWNER_USER_ID || "").trim();
      if (!id && !slug && ownerId) {
        query = query.eq("user_id", ownerId);
      }
      let data = null;
      let error = null;
      let count = null;
      if (limit && limit > 0) {
        if (wantCount) {
          const res = await query.range(offset, offset + Math.max(0, limit - 1)).select(shallow ? shallowSelect : baseSelect, { count: "exact" });
          data = res.data || null;
          error = res.error || null;
          count = typeof res.count === "number" ? res.count : null;
        } else {
          const res = await query.range(offset, offset + Math.max(0, limit - 1)).select(shallow ? shallowSelect : baseSelect);
          data = res.data || null;
          error = res.error || null;
        }
      } else {
        const res = await query.select(shallow ? shallowSelect : baseSelect);
        data = res.data || null;
        error = res.error || null;
      }
      if (error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      const transformed = (data || []).map((p) => {
        if (shallow) {
          const firstImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
          const imgUrl = firstImg && typeof firstImg.url === "string" && !firstImg.url.startsWith("data:") ? firstImg.url : null;
          const basePath = deriveBasePath(c, firstImg?.url || null);
          return {
            id: p.id,
            userId: p.user_id,
            title: p.title,
            slug: p.slug,
            tags: p.tags,
            price: p.price,
            published: p.published,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            image: imgUrl ? { url: imgUrl, width: firstImg?.width || null, height: firstImg?.height || null, role: firstImg?.role || null, basePath } : null
          };
        }
        return {
          id: p.id,
          userId: p.user_id,
          title: p.title,
          slug: p.slug,
          shortDescription: p.short_description,
          body: p.body,
          tags: p.tags,
          price: p.price,
          published: p.published,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          showPrice: p.show_price,
          notes: p.notes,
          relatedLinks: p.related_links,
          images: Array.isArray(p.images) ? p.images.map((img) => ({
            id: img.id,
            productId: img.product_id,
            url: img.url,
            width: img.width,
            height: img.height,
            aspect: img.aspect,
            role: img.role,
            basePath: deriveBasePath(c, img.url)
          })) : [],
          affiliateLinks: Array.isArray(p.affiliateLinks) ? p.affiliateLinks.map((l) => ({ provider: l.provider, url: l.url, label: l.label })) : []
        };
      });
      const meta = {};
      if (typeof count === "number") {
        meta.total = count;
        meta.limit = limit || null;
        meta.offset = offset || 0;
      }
      return new Response(JSON.stringify({ data: transformed, meta }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
    }
  });
});
function deriveBasePath(c, url) {
  return deriveBasePathFromUrl(url || null, c.env);
}
__name(deriveBasePath, "deriveBasePath");
var src_default = app;
app.all("/admin/*", async (c) => {
  try {
    const internalBase = (c.env.INTERNAL_API_BASE || "").replace(/\/$/, "");
    if (!internalBase)
      return new Response(JSON.stringify({ error: "internal api not configured" }), { status: 502 });
    const provided = c.req.header("x-internal-key") || c.req.header("X-Internal-Key") || "";
    const expected = (c.env.INTERNAL_API_KEY || "").toString();
    const auth = c.req.header("authorization") || c.req.header("Authorization") || "";
    const hasJwt = auth.toLowerCase().startsWith("bearer ");
    let jwtOk = false;
    let roleOk = false;
    if (hasJwt) {
      jwtOk = true;
      roleOk = true;
    }
    if (!jwtOk && (!expected || provided !== expected))
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    const rest = c.req.path.replace(/^\/admin/, "") || "/";
    const upstreamUrl = internalBase + rest + (Object.keys(c.req.query() || {}).length > 0 ? "?" + new URLSearchParams(c.req.query()).toString() : "");
    const method = c.req.method;
    const headers = {};
    const contentType = c.req.header("content-type");
    if (contentType)
      headers["content-type"] = contentType;
    headers["x-internal-key"] = provided;
    const body = method === "GET" || method === "HEAD" ? void 0 : await c.req.text();
    const resp = await fetch(upstreamUrl, { method, headers, body });
    const respBuf = await resp.arrayBuffer();
    const out = new Response(respBuf, { status: resp.status, headers: { "Content-Type": resp.headers.get("content-type") || "application/octet-stream" } });
    return out;
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
});
app.post("/upload-image", async (c) => {
  try {
    const ct = c.req.header("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "multipart/form-data required" }), { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }
    const form = await c.req.formData();
    const file = form.get("file");
    if (!file)
      return new Response(JSON.stringify({ error: "file is required" }), { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    const buf = await file.arrayBuffer();
    const now = /* @__PURE__ */ new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 10);
    const safeName = (file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
    const bucket = (c.env.R2_BUCKET || "images").replace(/^\/+|\/+$/g, "");
    const key = `${bucket}/images/${yyyy}/${mm}/${dd}/${rand}-${safeName}`;
    const putRes = await c.env.IMAGES.put(key, buf, { httpMetadata: { contentType: file.type || "application/octet-stream", cacheControl: "public, max-age=2592000" } });
    if (!putRes) {
      return new Response(JSON.stringify({ error: "failed to put object" }), { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }
    const pubRoot = (c.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
    const publicUrl = pubRoot ? `${pubRoot}/${key.replace(new RegExp(`^${bucket}/`), "")}` : null;
    return new Response(JSON.stringify({ ok: true, result: { key, publicUrl, size: buf.byteLength, contentType: file.type || null } }), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
  }
});

// node_modules/.pnpm/wrangler@3.114.15/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/.pnpm/wrangler@3.114.15/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-YRAKNw/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/.pnpm/wrangler@3.114.15/node_modules/wrangler/templates/middleware/common.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-YRAKNw/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
