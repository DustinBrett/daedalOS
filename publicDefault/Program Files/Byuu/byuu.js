function createCommonjsModule(fn, basedir, module) {
  return module = {
    path: basedir,
    exports: {},
    require: function(path, base) {
      return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
    }
  }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var eventemitter3 = createCommonjsModule(function(module) {
  var has = Object.prototype.hasOwnProperty, prefix = "~";
  function Events() {
  }
  if (Object.create) {
    Events.prototype = Object.create(null);
    if (!new Events().__proto__)
      prefix = false;
  }
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== "function") {
      throw new TypeError("The listener must be a function");
    }
    var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
    if (!emitter._events[evt])
      emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn)
      emitter._events[evt].push(listener);
    else
      emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0)
      emitter._events = new Events();
    else
      delete emitter._events[evt];
  }
  function EventEmitter2() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  EventEmitter2.prototype.eventNames = function eventNames() {
    var names = [], events, name;
    if (this._eventsCount === 0)
      return names;
    for (name in events = this._events) {
      if (has.call(events, name))
        names.push(prefix ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }
    return names;
  };
  EventEmitter2.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event, handlers = this._events[evt];
    if (!handlers)
      return [];
    if (handlers.fn)
      return [handlers.fn];
    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }
    return ee;
  };
  EventEmitter2.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event, listeners = this._events[evt];
    if (!listeners)
      return 0;
    if (listeners.fn)
      return 1;
    return listeners.length;
  };
  EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return false;
    var listeners = this._events[evt], len = arguments.length, args, i;
    if (listeners.fn) {
      if (listeners.once)
        this.removeListener(event, listeners.fn, void 0, true);
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }
      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }
      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length, j;
      for (i = 0; i < length; i++) {
        if (listeners[i].once)
          this.removeListener(event, listeners[i].fn, void 0, true);
        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;
          default:
            if (!args)
              for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }
    return true;
  };
  EventEmitter2.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  EventEmitter2.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  EventEmitter2.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }
      if (events.length)
        this._events[evt] = events.length === 1 ? events[0] : events;
      else
        clearEvent(this, evt);
    }
    return this;
  };
  EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt])
        clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  };
  EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
  EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
  EventEmitter2.prefixed = prefix;
  EventEmitter2.EventEmitter = EventEmitter2;
  {
    module.exports = EventEmitter2;
  }
});
var EventEmitter = eventemitter3.EventEmitter;
var prefixed = eventemitter3.prefixed;
var Module = function() {
  var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
  return function(Module2) {
    Module2 = Module2 || {};
    var Module2 = typeof Module2 !== "undefined" ? Module2 : {};
    var readyPromiseResolve, readyPromiseReject;
    Module2["ready"] = new Promise(function(resolve, reject) {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var moduleOverrides = {};
    var key;
    for (key in Module2) {
      if (Module2.hasOwnProperty(key)) {
        moduleOverrides[key] = Module2[key];
      }
    }
    var thisProgram = "./this.program";
    var ENVIRONMENT_IS_WEB = true;
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module2["locateFile"]) {
        return Module2["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary, setWindowTitle;
    {
      if (typeof document !== "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1);
      } else {
        scriptDirectory = "";
      }
      {
        read_ = function(url) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.send(null);
          return xhr.responseText;
        };
        readAsync = function(url, onload, onerror) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = function() {
            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
              onload(xhr.response);
              return;
            }
            onerror();
          };
          xhr.onerror = onerror;
          xhr.send(null);
        };
      }
      setWindowTitle = function(title) {
        document.title = title;
      };
    }
    var out = Module2["print"] || console.log.bind(console);
    var err = Module2["printErr"] || console.warn.bind(console);
    for (key in moduleOverrides) {
      if (moduleOverrides.hasOwnProperty(key)) {
        Module2[key] = moduleOverrides[key];
      }
    }
    moduleOverrides = null;
    if (Module2["arguments"])
      Module2["arguments"];
    if (Module2["thisProgram"])
      thisProgram = Module2["thisProgram"];
    if (Module2["quit"])
      Module2["quit"];
    var STACK_ALIGN = 16;
    function alignMemory(size, factor) {
      if (!factor)
        factor = STACK_ALIGN;
      return Math.ceil(size / factor) * factor;
    }
    function warnOnce(text) {
      if (!warnOnce.shown)
        warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }
    var tempRet0 = 0;
    var setTempRet0 = function(value) {
      tempRet0 = value;
    };
    var getTempRet0 = function() {
      return tempRet0;
    };
    var wasmBinary;
    if (Module2["wasmBinary"])
      wasmBinary = Module2["wasmBinary"];
    var noExitRuntime = Module2["noExitRuntime"] || true;
    if (typeof WebAssembly !== "object") {
      abort("no native wasm support detected");
    }
    function setValue(ptr, value, type, noSafe) {
      type = type || "i8";
      if (type.charAt(type.length - 1) === "*")
        type = "i32";
      switch (type) {
        case "i1":
          HEAP8[ptr >> 0] = value;
          break;
        case "i8":
          HEAP8[ptr >> 0] = value;
          break;
        case "i16":
          HEAP16[ptr >> 1] = value;
          break;
        case "i32":
          HEAP32[ptr >> 2] = value;
          break;
        case "i64":
          tempI64 = [value >>> 0, (tempDouble = value, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
          break;
        case "float":
          HEAPF32[ptr >> 2] = value;
          break;
        case "double":
          HEAPF64[ptr >> 3] = value;
          break;
        default:
          abort("invalid type for setValue: " + type);
      }
    }
    var wasmMemory;
    var ABORT = false;
    function assert(condition, text) {
      if (!condition) {
        abort("Assertion failed: " + text);
      }
    }
    var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : void 0;
    function UTF8ArrayToString(heap, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heap[endPtr] && !(endPtr >= endIdx))
        ++endPtr;
      if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(heap.subarray(idx, endPtr));
      } else {
        var str = "";
        while (idx < endPtr) {
          var u0 = heap[idx++];
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue;
          }
          var u1 = heap[idx++] & 63;
          if ((u0 & 224) == 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue;
          }
          var u2 = heap[idx++] & 63;
          if ((u0 & 240) == 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2;
          } else {
            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63;
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
          }
        }
      }
      return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0))
        return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i2 = 0; i2 < str.length; ++i2) {
        var u = str.charCodeAt(i2);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i2);
          u = 65536 + ((u & 1023) << 10) | u1 & 1023;
        }
        if (u <= 127) {
          if (outIdx >= endIdx)
            break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx)
            break;
          heap[outIdx++] = 192 | u >> 6;
          heap[outIdx++] = 128 | u & 63;
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx)
            break;
          heap[outIdx++] = 224 | u >> 12;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        } else {
          if (outIdx + 3 >= endIdx)
            break;
          heap[outIdx++] = 240 | u >> 18;
          heap[outIdx++] = 128 | u >> 12 & 63;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    function lengthBytesUTF8(str) {
      var len = 0;
      for (var i2 = 0; i2 < str.length; ++i2) {
        var u = str.charCodeAt(i2);
        if (u >= 55296 && u <= 57343)
          u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i2) & 1023;
        if (u <= 127)
          ++len;
        else if (u <= 2047)
          len += 2;
        else if (u <= 65535)
          len += 3;
        else
          len += 4;
      }
      return len;
    }
    var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : void 0;
    function UTF16ToString(ptr, maxBytesToRead) {
      var endPtr = ptr;
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      while (!(idx >= maxIdx) && HEAPU16[idx])
        ++idx;
      endPtr = idx << 1;
      if (endPtr - ptr > 32 && UTF16Decoder) {
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
      } else {
        var str = "";
        for (var i2 = 0; !(i2 >= maxBytesToRead / 2); ++i2) {
          var codeUnit = HEAP16[ptr + i2 * 2 >> 1];
          if (codeUnit == 0)
            break;
          str += String.fromCharCode(codeUnit);
        }
        return str;
      }
    }
    function stringToUTF16(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === void 0) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 2)
        return 0;
      maxBytesToWrite -= 2;
      var startPtr = outPtr;
      var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
      for (var i2 = 0; i2 < numCharsToWrite; ++i2) {
        var codeUnit = str.charCodeAt(i2);
        HEAP16[outPtr >> 1] = codeUnit;
        outPtr += 2;
      }
      HEAP16[outPtr >> 1] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF16(str) {
      return str.length * 2;
    }
    function UTF32ToString(ptr, maxBytesToRead) {
      var i2 = 0;
      var str = "";
      while (!(i2 >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[ptr + i2 * 4 >> 2];
        if (utf32 == 0)
          break;
        ++i2;
        if (utf32 >= 65536) {
          var ch = utf32 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }
    function stringToUTF32(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === void 0) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 4)
        return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i2 = 0; i2 < str.length; ++i2) {
        var codeUnit = str.charCodeAt(i2);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
          var trailSurrogate = str.charCodeAt(++i2);
          codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr)
          break;
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF32(str) {
      var len = 0;
      for (var i2 = 0; i2 < str.length; ++i2) {
        var codeUnit = str.charCodeAt(i2);
        if (codeUnit >= 55296 && codeUnit <= 57343)
          ++i2;
        len += 4;
      }
      return len;
    }
    function allocateUTF8(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret)
        stringToUTF8Array(str, HEAP8, ret, size);
      return ret;
    }
    function writeAsciiToMemory(str, buffer2, dontAddNull) {
      for (var i2 = 0; i2 < str.length; ++i2) {
        HEAP8[buffer2++ >> 0] = str.charCodeAt(i2);
      }
      if (!dontAddNull)
        HEAP8[buffer2 >> 0] = 0;
    }
    var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateGlobalBufferAndViews(buf) {
      buffer = buf;
      Module2["HEAP8"] = HEAP8 = new Int8Array(buf);
      Module2["HEAP16"] = HEAP16 = new Int16Array(buf);
      Module2["HEAP32"] = HEAP32 = new Int32Array(buf);
      Module2["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
      Module2["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
      Module2["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
      Module2["HEAPF32"] = HEAPF32 = new Float32Array(buf);
      Module2["HEAPF64"] = HEAPF64 = new Float64Array(buf);
    }
    var INITIAL_MEMORY = Module2["INITIAL_MEMORY"] || 167772160;
    var wasmTable;
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATMAIN__ = [];
    var __ATPOSTRUN__ = [];
    __ATINIT__.push({func: function() {
      ___wasm_call_ctors();
    }});
    function preRun() {
      if (Module2["preRun"]) {
        if (typeof Module2["preRun"] == "function")
          Module2["preRun"] = [Module2["preRun"]];
        while (Module2["preRun"].length) {
          addOnPreRun(Module2["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      if (!Module2["noFSInit"] && !FS.init.initialized)
        FS.init();
      TTY.init();
      callRuntimeCallbacks(__ATINIT__);
    }
    function preMain() {
      FS.ignorePermissions = false;
      callRuntimeCallbacks(__ATMAIN__);
    }
    function postRun() {
      if (Module2["postRun"]) {
        if (typeof Module2["postRun"] == "function")
          Module2["postRun"] = [Module2["postRun"]];
        while (Module2["postRun"].length) {
          addOnPostRun(Module2["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var dependenciesFulfilled = null;
    function getUniqueRunDependency(id) {
      return id;
    }
    function addRunDependency(id) {
      runDependencies++;
      if (Module2["monitorRunDependencies"]) {
        Module2["monitorRunDependencies"](runDependencies);
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module2["monitorRunDependencies"]) {
        Module2["monitorRunDependencies"](runDependencies);
      }
      if (runDependencies == 0) {
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    Module2["preloadedImages"] = {};
    Module2["preloadedAudios"] = {};
    function abort(what) {
      if (Module2["onAbort"]) {
        Module2["onAbort"](what);
      }
      what += "";
      err(what);
      ABORT = true;
      what = "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    function hasPrefix(str, prefix) {
      return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0;
    }
    var dataURIPrefix = "data:application/octet-stream;base64,";
    function isDataURI(filename) {
      return hasPrefix(filename, dataURIPrefix);
    }
    var wasmBinaryFile = "byuu-web-lib.wasm";
    if (!isDataURI(wasmBinaryFile)) {
      wasmBinaryFile = locateFile(wasmBinaryFile);
    }
    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary)
          ;
        else {
          throw "both async and sync fetching of the wasm failed";
        }
      } catch (err2) {
        abort(err2);
      }
    }
    function getBinaryPromise() {
      if (!wasmBinary && ENVIRONMENT_IS_WEB) {
        if (typeof fetch === "function") {
          return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function(response) {
            if (!response["ok"]) {
              throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
            }
            return response["arrayBuffer"]();
          }).catch(function() {
            return getBinary(wasmBinaryFile);
          });
        }
      }
      return Promise.resolve().then(function() {
        return getBinary(wasmBinaryFile);
      });
    }
    function createWasm() {
      var info = {a: asmLibraryArg};
      function receiveInstance(instance, module) {
        var exports2 = instance.exports;
        Module2["asm"] = exports2;
        wasmMemory = Module2["asm"]["ze"];
        updateGlobalBufferAndViews(wasmMemory.buffer);
        wasmTable = Module2["asm"]["Ee"];
        removeRunDependency();
      }
      addRunDependency();
      function receiveInstantiatedSource(output) {
        receiveInstance(output["instance"]);
      }
      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise().then(function(binary) {
          return WebAssembly.instantiate(binary, info);
        }).then(receiver, function(reason) {
          err("failed to asynchronously prepare wasm: " + reason);
          abort(reason);
        });
      }
      function instantiateAsync() {
        if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
          return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function(response) {
            var result = WebAssembly.instantiateStreaming(response, info);
            return result.then(receiveInstantiatedSource, function(reason) {
              err("wasm streaming compile failed: " + reason);
              err("falling back to ArrayBuffer instantiation");
              return instantiateArrayBuffer(receiveInstantiatedSource);
            });
          });
        } else {
          return instantiateArrayBuffer(receiveInstantiatedSource);
        }
      }
      if (Module2["instantiateWasm"]) {
        try {
          var exports = Module2["instantiateWasm"](info, receiveInstance);
          return exports;
        } catch (e) {
          err("Module.instantiateWasm callback failed with error: " + e);
          return false;
        }
      }
      instantiateAsync().catch(readyPromiseReject);
      return {};
    }
    var tempDouble;
    var tempI64;
    var ASM_CONSTS = {195444: function() {
      window.realHandler = JSEvents.registerOrRemoveHandler;
      JSEvents.registerOrRemoveHandler = () => true;
    }, 195550: function() {
      JSEvents.registerOrRemoveHandler = window.realHandler;
      delete window.realHandler;
    }, 195636: function() {
      window.addEventListener("touchstart", () => {
        const {audioCtx} = AL.currentCtx;
        if (audioCtx.state == "suspended") {
          audioCtx.resume();
        }
      }, {once: true});
    }, 195799: function() {
      var AudioContext2 = window.AudioContext || window.webkitAudioContext;
      var ctx = new AudioContext2();
      var sr = ctx.sampleRate;
      ctx.close();
      return sr;
    }, 195951: function() {
      if (!AL || !AL.currentCtx) {
        return 0;
      }
      const {audioCtx} = AL.currentCtx;
      if (audioCtx.state == "suspended") {
        audioCtx.resume();
      }
      return 1;
    }, 196098: function($0, $1, $2) {
      var w = $0;
      var h = $1;
      var pixels = $2;
      if (!Module2["SDL2"])
        Module2["SDL2"] = {};
      var SDL2 = Module2["SDL2"];
      if (SDL2.ctxCanvas !== Module2["canvas"]) {
        SDL2.ctx = Module2["createContext"](Module2["canvas"], false, true);
        SDL2.ctxCanvas = Module2["canvas"];
      }
      if (SDL2.w !== w || SDL2.h !== h || SDL2.imageCtx !== SDL2.ctx) {
        SDL2.image = SDL2.ctx.createImageData(w, h);
        SDL2.w = w;
        SDL2.h = h;
        SDL2.imageCtx = SDL2.ctx;
      }
      var data = SDL2.image.data;
      var src = pixels >> 2;
      var dst = 0;
      var num;
      if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
        num = data.length;
        while (dst < num) {
          var val = HEAP32[src];
          data[dst] = val & 255;
          data[dst + 1] = val >> 8 & 255;
          data[dst + 2] = val >> 16 & 255;
          data[dst + 3] = 255;
          src++;
          dst += 4;
        }
      } else {
        if (SDL2.data32Data !== data) {
          SDL2.data32 = new Int32Array(data.buffer);
          SDL2.data8 = new Uint8Array(data.buffer);
        }
        var data32 = SDL2.data32;
        num = data32.length;
        data32.set(HEAP32.subarray(src, src + num));
        var data8 = SDL2.data8;
        var i2 = 3;
        var j = i2 + 4 * num;
        if (num % 8 == 0) {
          while (i2 < j) {
            data8[i2] = 255;
            i2 = i2 + 4 | 0;
            data8[i2] = 255;
            i2 = i2 + 4 | 0;
            data8[i2] = 255;
            i2 = i2 + 4 | 0;
            data8[i2] = 255;
            i2 = i2 + 4 | 0;
            data8[i2] = 255;
            i2 = i2 + 4 | 0;
            data8[i2] = 255;
            i2 = i2 + 4 | 0;
            data8[i2] = 255;
            i2 = i2 + 4 | 0;
            data8[i2] = 255;
            i2 = i2 + 4 | 0;
          }
        } else {
          while (i2 < j) {
            data8[i2] = 255;
            i2 = i2 + 4 | 0;
          }
        }
      }
      SDL2.ctx.putImageData(SDL2.image, 0, 0);
      return 0;
    }, 197553: function($0, $1, $2, $3, $4) {
      var w = $0;
      var h = $1;
      var hot_x = $2;
      var hot_y = $3;
      var pixels = $4;
      var canvas2 = document.createElement("canvas");
      canvas2.width = w;
      canvas2.height = h;
      var ctx = canvas2.getContext("2d");
      var image = ctx.createImageData(w, h);
      var data = image.data;
      var src = pixels >> 2;
      var dst = 0;
      var num;
      if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
        num = data.length;
        while (dst < num) {
          var val = HEAP32[src];
          data[dst] = val & 255;
          data[dst + 1] = val >> 8 & 255;
          data[dst + 2] = val >> 16 & 255;
          data[dst + 3] = val >> 24 & 255;
          src++;
          dst += 4;
        }
      } else {
        var data32 = new Int32Array(data.buffer);
        num = data32.length;
        data32.set(HEAP32.subarray(src, src + num));
      }
      ctx.putImageData(image, 0, 0);
      var url = hot_x === 0 && hot_y === 0 ? "url(" + canvas2.toDataURL() + "), auto" : "url(" + canvas2.toDataURL() + ") " + hot_x + " " + hot_y + ", auto";
      var urlBuf = _malloc(url.length + 1);
      stringToUTF8(url, urlBuf, url.length + 1);
      return urlBuf;
    }, 198542: function($0) {
      if (Module2["canvas"]) {
        Module2["canvas"].style["cursor"] = UTF8ToString($0);
      }
      return 0;
    }, 198635: function() {
      if (Module2["canvas"]) {
        Module2["canvas"].style["cursor"] = "none";
      }
    }, 198704: function() {
      return screen.width;
    }, 198729: function() {
      return screen.height;
    }, 198755: function() {
      return window.innerWidth;
    }, 198785: function() {
      return window.innerHeight;
    }, 198816: function($0) {
      if (typeof setWindowTitle !== "undefined") {
        setWindowTitle(UTF8ToString($0));
      }
      return 0;
    }, 198911: function() {
      if (typeof AudioContext !== "undefined") {
        return 1;
      } else if (typeof webkitAudioContext !== "undefined") {
        return 1;
      }
      return 0;
    }, 199048: function() {
      if (typeof navigator.mediaDevices !== "undefined" && typeof navigator.mediaDevices.getUserMedia !== "undefined") {
        return 1;
      } else if (typeof navigator.webkitGetUserMedia !== "undefined") {
        return 1;
      }
      return 0;
    }, 199272: function($0) {
      if (typeof Module2["SDL2"] === "undefined") {
        Module2["SDL2"] = {};
      }
      var SDL2 = Module2["SDL2"];
      if (!$0) {
        SDL2.audio = {};
      } else {
        SDL2.capture = {};
      }
      if (!SDL2.audioContext) {
        if (typeof AudioContext !== "undefined") {
          SDL2.audioContext = new AudioContext();
        } else if (typeof webkitAudioContext !== "undefined") {
          SDL2.audioContext = new webkitAudioContext();
        }
        if (SDL2.audioContext) {
          autoResumeAudioContext(SDL2.audioContext);
        }
      }
      return SDL2.audioContext === void 0 ? -1 : 0;
    }, 199765: function() {
      var SDL2 = Module2["SDL2"];
      return SDL2.audioContext.sampleRate;
    }, 199833: function($0, $1, $2, $3) {
      var SDL2 = Module2["SDL2"];
      var have_microphone = function(stream) {
        if (SDL2.capture.silenceTimer !== void 0) {
          clearTimeout(SDL2.capture.silenceTimer);
          SDL2.capture.silenceTimer = void 0;
        }
        SDL2.capture.mediaStreamNode = SDL2.audioContext.createMediaStreamSource(stream);
        SDL2.capture.scriptProcessorNode = SDL2.audioContext.createScriptProcessor($1, $0, 1);
        SDL2.capture.scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {
          if (SDL2 === void 0 || SDL2.capture === void 0) {
            return;
          }
          audioProcessingEvent.outputBuffer.getChannelData(0).fill(0);
          SDL2.capture.currentCaptureBuffer = audioProcessingEvent.inputBuffer;
          dynCall("vi", $2, [$3]);
        };
        SDL2.capture.mediaStreamNode.connect(SDL2.capture.scriptProcessorNode);
        SDL2.capture.scriptProcessorNode.connect(SDL2.audioContext.destination);
        SDL2.capture.stream = stream;
      };
      var no_microphone = function(error) {
      };
      SDL2.capture.silenceBuffer = SDL2.audioContext.createBuffer($0, $1, SDL2.audioContext.sampleRate);
      SDL2.capture.silenceBuffer.getChannelData(0).fill(0);
      var silence_callback = function() {
        SDL2.capture.currentCaptureBuffer = SDL2.capture.silenceBuffer;
        dynCall("vi", $2, [$3]);
      };
      SDL2.capture.silenceTimer = setTimeout(silence_callback, $1 / SDL2.audioContext.sampleRate * 1e3);
      if (navigator.mediaDevices !== void 0 && navigator.mediaDevices.getUserMedia !== void 0) {
        navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(have_microphone).catch(no_microphone);
      } else if (navigator.webkitGetUserMedia !== void 0) {
        navigator.webkitGetUserMedia({audio: true, video: false}, have_microphone, no_microphone);
      }
    }, 201485: function($0, $1, $2, $3) {
      var SDL2 = Module2["SDL2"];
      SDL2.audio.scriptProcessorNode = SDL2.audioContext["createScriptProcessor"]($1, 0, $0);
      SDL2.audio.scriptProcessorNode["onaudioprocess"] = function(e) {
        if (SDL2 === void 0 || SDL2.audio === void 0) {
          return;
        }
        SDL2.audio.currentOutputBuffer = e["outputBuffer"];
        dynCall("vi", $2, [$3]);
      };
      SDL2.audio.scriptProcessorNode["connect"](SDL2.audioContext["destination"]);
    }, 201895: function($0, $1) {
      var SDL2 = Module2["SDL2"];
      var numChannels = SDL2.capture.currentCaptureBuffer.numberOfChannels;
      for (var c = 0; c < numChannels; ++c) {
        var channelData = SDL2.capture.currentCaptureBuffer.getChannelData(c);
        if (channelData.length != $1) {
          throw "Web Audio capture buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
        }
        if (numChannels == 1) {
          for (var j = 0; j < $1; ++j) {
            setValue($0 + j * 4, channelData[j], "float");
          }
        } else {
          for (var j = 0; j < $1; ++j) {
            setValue($0 + (j * numChannels + c) * 4, channelData[j], "float");
          }
        }
      }
    }, 202500: function($0, $1) {
      var SDL2 = Module2["SDL2"];
      var numChannels = SDL2.audio.currentOutputBuffer["numberOfChannels"];
      for (var c = 0; c < numChannels; ++c) {
        var channelData = SDL2.audio.currentOutputBuffer["getChannelData"](c);
        if (channelData.length != $1) {
          throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
        }
        for (var j = 0; j < $1; ++j) {
          channelData[j] = HEAPF32[$0 + (j * numChannels + c << 2) >> 2];
        }
      }
    }, 202980: function($0) {
      var SDL2 = Module2["SDL2"];
      if ($0) {
        if (SDL2.capture.silenceTimer !== void 0) {
          clearTimeout(SDL2.capture.silenceTimer);
        }
        if (SDL2.capture.stream !== void 0) {
          var tracks = SDL2.capture.stream.getAudioTracks();
          for (var i2 = 0; i2 < tracks.length; i2++) {
            SDL2.capture.stream.removeTrack(tracks[i2]);
          }
          SDL2.capture.stream = void 0;
        }
        if (SDL2.capture.scriptProcessorNode !== void 0) {
          SDL2.capture.scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {
          };
          SDL2.capture.scriptProcessorNode.disconnect();
          SDL2.capture.scriptProcessorNode = void 0;
        }
        if (SDL2.capture.mediaStreamNode !== void 0) {
          SDL2.capture.mediaStreamNode.disconnect();
          SDL2.capture.mediaStreamNode = void 0;
        }
        if (SDL2.capture.silenceBuffer !== void 0) {
          SDL2.capture.silenceBuffer = void 0;
        }
        SDL2.capture = void 0;
      } else {
        if (SDL2.audio.scriptProcessorNode != void 0) {
          SDL2.audio.scriptProcessorNode.disconnect();
          SDL2.audio.scriptProcessorNode = void 0;
        }
        SDL2.audio = void 0;
      }
      if (SDL2.audioContext !== void 0 && SDL2.audio === void 0 && SDL2.capture === void 0) {
        SDL2.audioContext.close();
        SDL2.audioContext = void 0;
      }
    }};
    function listenOnce(object, event2, func) {
      object.addEventListener(event2, func, {once: true});
    }
    function autoResumeAudioContext(ctx, elements) {
      if (!elements) {
        elements = [document, document.getElementById("byuuCanvas")];
      }
      ["keydown", "mousedown", "touchstart"].forEach(function(event2) {
        elements.forEach(function(element) {
          if (element) {
            listenOnce(element, event2, function() {
              if (ctx.state === "suspended")
                ctx.resume();
            });
          }
        });
      });
    }
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
          callback(Module2);
          continue;
        }
        var func = callback.func;
        if (typeof func === "number") {
          if (callback.arg === void 0) {
            wasmTable.get(func)();
          } else {
            wasmTable.get(func)(callback.arg);
          }
        } else {
          func(callback.arg === void 0 ? null : callback.arg);
        }
      }
    }
    function dynCallLegacy(sig, ptr, args) {
      var f = Module2["dynCall_" + sig];
      return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
    }
    function dynCall(sig, ptr, args) {
      if (sig.indexOf("j") != -1) {
        return dynCallLegacy(sig, ptr, args);
      }
      return wasmTable.get(ptr).apply(null, args);
    }
    var ExceptionInfoAttrs = {DESTRUCTOR_OFFSET: 0, REFCOUNT_OFFSET: 4, TYPE_OFFSET: 8, CAUGHT_OFFSET: 12, RETHROWN_OFFSET: 13, SIZE: 16};
    function ___cxa_allocate_exception(size) {
      return _malloc(size + ExceptionInfoAttrs.SIZE) + ExceptionInfoAttrs.SIZE;
    }
    var exceptionCaught = [];
    function ___cxa_rethrow() {
      var catchInfo = exceptionCaught.pop();
      if (!catchInfo) {
        abort("no exception to throw");
      }
      var info = catchInfo.get_exception_info();
      var ptr = catchInfo.get_base_ptr();
      if (!info.get_rethrown()) {
        exceptionCaught.push(catchInfo);
        info.set_rethrown(true);
        info.set_caught(false);
      } else {
        catchInfo.free();
      }
      throw ptr;
    }
    function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - ExceptionInfoAttrs.SIZE;
      this.set_type = function(type) {
        HEAP32[this.ptr + ExceptionInfoAttrs.TYPE_OFFSET >> 2] = type;
      };
      this.get_type = function() {
        return HEAP32[this.ptr + ExceptionInfoAttrs.TYPE_OFFSET >> 2];
      };
      this.set_destructor = function(destructor) {
        HEAP32[this.ptr + ExceptionInfoAttrs.DESTRUCTOR_OFFSET >> 2] = destructor;
      };
      this.get_destructor = function() {
        return HEAP32[this.ptr + ExceptionInfoAttrs.DESTRUCTOR_OFFSET >> 2];
      };
      this.set_refcount = function(refcount) {
        HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2] = refcount;
      };
      this.set_caught = function(caught) {
        caught = caught ? 1 : 0;
        HEAP8[this.ptr + ExceptionInfoAttrs.CAUGHT_OFFSET >> 0] = caught;
      };
      this.get_caught = function() {
        return HEAP8[this.ptr + ExceptionInfoAttrs.CAUGHT_OFFSET >> 0] != 0;
      };
      this.set_rethrown = function(rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[this.ptr + ExceptionInfoAttrs.RETHROWN_OFFSET >> 0] = rethrown;
      };
      this.get_rethrown = function() {
        return HEAP8[this.ptr + ExceptionInfoAttrs.RETHROWN_OFFSET >> 0] != 0;
      };
      this.init = function(type, destructor) {
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      };
      this.add_ref = function() {
        var value = HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2];
        HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2] = value + 1;
      };
      this.release_ref = function() {
        var prev = HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2];
        HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2] = prev - 1;
        return prev === 1;
      };
    }
    function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      info.init(type, destructor);
      throw ptr;
    }
    function _tzset() {
      if (_tzset.called)
        return;
      _tzset.called = true;
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
      HEAP32[__get_timezone() >> 2] = stdTimezoneOffset * 60;
      HEAP32[__get_daylight() >> 2] = Number(winterOffset != summerOffset);
      function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT";
      }
      var winterName = extractZone(winter);
      var summerName = extractZone(summer);
      var winterNamePtr = allocateUTF8(winterName);
      var summerNamePtr = allocateUTF8(summerName);
      if (summerOffset < winterOffset) {
        HEAP32[__get_tzname() >> 2] = winterNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = summerNamePtr;
      } else {
        HEAP32[__get_tzname() >> 2] = summerNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = winterNamePtr;
      }
    }
    function _localtime_r(time, tmPtr) {
      _tzset();
      var date = new Date(HEAP32[time >> 2] * 1e3);
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
      HEAP32[tmPtr + 8 >> 2] = date.getHours();
      HEAP32[tmPtr + 12 >> 2] = date.getDate();
      HEAP32[tmPtr + 16 >> 2] = date.getMonth();
      HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
      HEAP32[tmPtr + 24 >> 2] = date.getDay();
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
      HEAP32[tmPtr + 28 >> 2] = yday;
      HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
      HEAP32[tmPtr + 32 >> 2] = dst;
      var zonePtr = HEAP32[__get_tzname() + (dst ? 4 : 0) >> 2];
      HEAP32[tmPtr + 40 >> 2] = zonePtr;
      return tmPtr;
    }
    function ___localtime_r(a0, a1) {
      return _localtime_r(a0, a1);
    }
    var PATH = {splitPath: function(filename) {
      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return splitPathRe.exec(filename).slice(1);
    }, normalizeArray: function(parts, allowAboveRoot) {
      var up = 0;
      for (var i2 = parts.length - 1; i2 >= 0; i2--) {
        var last = parts[i2];
        if (last === ".") {
          parts.splice(i2, 1);
        } else if (last === "..") {
          parts.splice(i2, 1);
          up++;
        } else if (up) {
          parts.splice(i2, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (; up; up--) {
          parts.unshift("..");
        }
      }
      return parts;
    }, normalize: function(path) {
      var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
      path = PATH.normalizeArray(path.split("/").filter(function(p) {
        return !!p;
      }), !isAbsolute).join("/");
      if (!path && !isAbsolute) {
        path = ".";
      }
      if (path && trailingSlash) {
        path += "/";
      }
      return (isAbsolute ? "/" : "") + path;
    }, dirname: function(path) {
      var result = PATH.splitPath(path), root = result[0], dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    }, basename: function(path) {
      if (path === "/")
        return "/";
      path = PATH.normalize(path);
      path = path.replace(/\/$/, "");
      var lastSlash = path.lastIndexOf("/");
      if (lastSlash === -1)
        return path;
      return path.substr(lastSlash + 1);
    }, extname: function(path) {
      return PATH.splitPath(path)[3];
    }, join: function() {
      var paths = Array.prototype.slice.call(arguments, 0);
      return PATH.normalize(paths.join("/"));
    }, join2: function(l, r) {
      return PATH.normalize(l + "/" + r);
    }};
    function getRandomDevice() {
      if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
        var randomBuffer = new Uint8Array(1);
        return function() {
          crypto.getRandomValues(randomBuffer);
          return randomBuffer[0];
        };
      } else
        return function() {
          abort("randomDevice");
        };
    }
    var PATH_FS = {resolve: function() {
      var resolvedPath = "", resolvedAbsolute = false;
      for (var i2 = arguments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
        var path = i2 >= 0 ? arguments[i2] : FS.cwd();
        if (typeof path !== "string") {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          return "";
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = path.charAt(0) === "/";
      }
      resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
        return !!p;
      }), !resolvedAbsolute).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    }, relative: function(from, to) {
      from = PATH_FS.resolve(from).substr(1);
      to = PATH_FS.resolve(to).substr(1);
      function trim(arr) {
        var start = 0;
        for (; start < arr.length; start++) {
          if (arr[start] !== "")
            break;
        }
        var end = arr.length - 1;
        for (; end >= 0; end--) {
          if (arr[end] !== "")
            break;
        }
        if (start > end)
          return [];
        return arr.slice(start, end - start + 1);
      }
      var fromParts = trim(from.split("/"));
      var toParts = trim(to.split("/"));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i2 = 0; i2 < length; i2++) {
        if (fromParts[i2] !== toParts[i2]) {
          samePartsLength = i2;
          break;
        }
      }
      var outputParts = [];
      for (var i2 = samePartsLength; i2 < fromParts.length; i2++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    }};
    var TTY = {ttys: [], init: function() {
    }, shutdown: function() {
    }, register: function(dev, ops) {
      TTY.ttys[dev] = {input: [], output: [], ops};
      FS.registerDevice(dev, TTY.stream_ops);
    }, stream_ops: {open: function(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    }, close: function(stream) {
      stream.tty.ops.flush(stream.tty);
    }, flush: function(stream) {
      stream.tty.ops.flush(stream.tty);
    }, read: function(stream, buffer2, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i2 = 0; i2 < length; i2++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === void 0 && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === void 0)
          break;
        bytesRead++;
        buffer2[offset + i2] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    }, write: function(stream, buffer2, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i2 = 0; i2 < length; i2++) {
          stream.tty.ops.put_char(stream.tty, buffer2[offset + i2]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i2;
    }}, default_tty_ops: {get_char: function(tty) {
      if (!tty.input.length) {
        var result = null;
        if (typeof window != "undefined" && typeof window.prompt == "function") {
          result = window.prompt("Input: ");
          if (result !== null) {
            result += "\n";
          }
        } else if (typeof readline == "function") {
          result = readline();
          if (result !== null) {
            result += "\n";
          }
        }
        if (!result) {
          return null;
        }
        tty.input = intArrayFromString(result, true);
      }
      return tty.input.shift();
    }, put_char: function(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0)
          tty.output.push(val);
      }
    }, flush: function(tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    }}, default_tty1_ops: {put_char: function(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0)
          tty.output.push(val);
      }
    }, flush: function(tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    }}};
    function mmapAlloc(size) {
      var alignedSize = alignMemory(size, 16384);
      var ptr = _malloc(alignedSize);
      while (size < alignedSize)
        HEAP8[ptr + size++] = 0;
      return ptr;
    }
    var MEMFS = {ops_table: null, mount: function(mount) {
      return MEMFS.createNode(null, "/", 16384 | 511, 0);
    }, createNode: function(parent, name, mode, dev) {
      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
        throw new FS.ErrnoError(63);
      }
      if (!MEMFS.ops_table) {
        MEMFS.ops_table = {dir: {node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink}, stream: {llseek: MEMFS.stream_ops.llseek}}, file: {node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr}, stream: {llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write, allocate: MEMFS.stream_ops.allocate, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync}}, link: {node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink}, stream: {}}, chrdev: {node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr}, stream: FS.chrdev_stream_ops}};
      }
      var node = FS.createNode(parent, name, mode, dev);
      if (FS.isDir(node.mode)) {
        node.node_ops = MEMFS.ops_table.dir.node;
        node.stream_ops = MEMFS.ops_table.dir.stream;
        node.contents = {};
      } else if (FS.isFile(node.mode)) {
        node.node_ops = MEMFS.ops_table.file.node;
        node.stream_ops = MEMFS.ops_table.file.stream;
        node.usedBytes = 0;
        node.contents = null;
      } else if (FS.isLink(node.mode)) {
        node.node_ops = MEMFS.ops_table.link.node;
        node.stream_ops = MEMFS.ops_table.link.stream;
      } else if (FS.isChrdev(node.mode)) {
        node.node_ops = MEMFS.ops_table.chrdev.node;
        node.stream_ops = MEMFS.ops_table.chrdev.stream;
      }
      node.timestamp = Date.now();
      if (parent) {
        parent.contents[name] = node;
        parent.timestamp = node.timestamp;
      }
      return node;
    }, getFileDataAsTypedArray: function(node) {
      if (!node.contents)
        return new Uint8Array(0);
      if (node.contents.subarray)
        return node.contents.subarray(0, node.usedBytes);
      return new Uint8Array(node.contents);
    }, expandFileStorage: function(node, newCapacity) {
      var prevCapacity = node.contents ? node.contents.length : 0;
      if (prevCapacity >= newCapacity)
        return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
      if (prevCapacity != 0)
        newCapacity = Math.max(newCapacity, 256);
      var oldContents = node.contents;
      node.contents = new Uint8Array(newCapacity);
      if (node.usedBytes > 0)
        node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
    }, resizeFileStorage: function(node, newSize) {
      if (node.usedBytes == newSize)
        return;
      if (newSize == 0) {
        node.contents = null;
        node.usedBytes = 0;
      } else {
        var oldContents = node.contents;
        node.contents = new Uint8Array(newSize);
        if (oldContents) {
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
        }
        node.usedBytes = newSize;
      }
    }, node_ops: {getattr: function(node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    }, setattr: function(node, attr) {
      if (attr.mode !== void 0) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== void 0) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== void 0) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    }, lookup: function(parent, name) {
      throw FS.genericErrors[44];
    }, mknod: function(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    }, rename: function(old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
        }
        if (new_node) {
          for (var i2 in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
      }
      delete old_node.parent.contents[old_node.name];
      old_node.parent.timestamp = Date.now();
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      new_dir.timestamp = old_node.parent.timestamp;
      old_node.parent = new_dir;
    }, unlink: function(parent, name) {
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, rmdir: function(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i2 in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, readdir: function(node) {
      var entries = [".", ".."];
      for (var key2 in node.contents) {
        if (!node.contents.hasOwnProperty(key2)) {
          continue;
        }
        entries.push(key2);
      }
      return entries;
    }, symlink: function(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    }, readlink: function(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    }}, stream_ops: {read: function(stream, buffer2, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes)
        return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer2.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i2 = 0; i2 < size; i2++)
          buffer2[offset + i2] = contents[position + i2];
      }
      return size;
    }, write: function(stream, buffer2, offset, length, position, canOwn) {
      if (!length)
        return 0;
      var node = stream.node;
      node.timestamp = Date.now();
      if (buffer2.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer2.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer2.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer2.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer2.subarray) {
        node.contents.set(buffer2.subarray(offset, offset + length), position);
      } else {
        for (var i2 = 0; i2 < length; i2++) {
          node.contents[position + i2] = buffer2[offset + i2];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    }, llseek: function(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    }, allocate: function(stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    }, mmap: function(stream, address, length, position, prot, flags) {
      if (address !== 0) {
        throw new FS.ErrnoError(28);
      }
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents.buffer === buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(contents, position, position + length);
          }
        }
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        HEAP8.set(contents, ptr);
      }
      return {ptr, allocated};
    }, msync: function(stream, buffer2, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (mmapFlags & 2) {
        return 0;
      }
      var bytesWritten = MEMFS.stream_ops.write(stream, buffer2, 0, length, offset, false);
      return 0;
    }}};
    var FS = {root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, trackingDelegate: {}, tracking: {openFlags: {READ: 1, WRITE: 2}}, ErrnoError: null, genericErrors: {}, filesystems: null, syncFSRequests: 0, lookupPath: function(path, opts) {
      path = PATH_FS.resolve(FS.cwd(), path);
      opts = opts || {};
      if (!path)
        return {path: "", node: null};
      var defaults = {follow_mount: true, recurse_count: 0};
      for (var key2 in defaults) {
        if (opts[key2] === void 0) {
          opts[key2] = defaults[key2];
        }
      }
      if (opts.recurse_count > 8) {
        throw new FS.ErrnoError(32);
      }
      var parts = PATH.normalizeArray(path.split("/").filter(function(p) {
        return !!p;
      }), false);
      var current = FS.root;
      var current_path = "/";
      for (var i2 = 0; i2 < parts.length; i2++) {
        var islast = i2 === parts.length - 1;
        if (islast && opts.parent) {
          break;
        }
        current = FS.lookupNode(current, parts[i2]);
        current_path = PATH.join2(current_path, parts[i2]);
        if (FS.isMountpoint(current)) {
          if (!islast || islast && opts.follow_mount) {
            current = current.mounted.root;
          }
        }
        if (!islast || opts.follow) {
          var count = 0;
          while (FS.isLink(current.mode)) {
            var link = FS.readlink(current_path);
            current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
            var lookup = FS.lookupPath(current_path, {recurse_count: opts.recurse_count});
            current = lookup.node;
            if (count++ > 40) {
              throw new FS.ErrnoError(32);
            }
          }
        }
      }
      return {path: current_path, node: current};
    }, getPath: function(node) {
      var path;
      while (true) {
        if (FS.isRoot(node)) {
          var mount = node.mount.mountpoint;
          if (!path)
            return mount;
          return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
        }
        path = path ? node.name + "/" + path : node.name;
        node = node.parent;
      }
    }, hashName: function(parentid, name) {
      var hash = 0;
      for (var i2 = 0; i2 < name.length; i2++) {
        hash = (hash << 5) - hash + name.charCodeAt(i2) | 0;
      }
      return (parentid + hash >>> 0) % FS.nameTable.length;
    }, hashAddNode: function(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      node.name_next = FS.nameTable[hash];
      FS.nameTable[hash] = node;
    }, hashRemoveNode: function(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      if (FS.nameTable[hash] === node) {
        FS.nameTable[hash] = node.name_next;
      } else {
        var current = FS.nameTable[hash];
        while (current) {
          if (current.name_next === node) {
            current.name_next = node.name_next;
            break;
          }
          current = current.name_next;
        }
      }
    }, lookupNode: function(parent, name) {
      var errCode = FS.mayLookup(parent);
      if (errCode) {
        throw new FS.ErrnoError(errCode, parent);
      }
      var hash = FS.hashName(parent.id, name);
      for (var node = FS.nameTable[hash]; node; node = node.name_next) {
        var nodeName = node.name;
        if (node.parent.id === parent.id && nodeName === name) {
          return node;
        }
      }
      return FS.lookup(parent, name);
    }, createNode: function(parent, name, mode, rdev) {
      var node = new FS.FSNode(parent, name, mode, rdev);
      FS.hashAddNode(node);
      return node;
    }, destroyNode: function(node) {
      FS.hashRemoveNode(node);
    }, isRoot: function(node) {
      return node === node.parent;
    }, isMountpoint: function(node) {
      return !!node.mounted;
    }, isFile: function(mode) {
      return (mode & 61440) === 32768;
    }, isDir: function(mode) {
      return (mode & 61440) === 16384;
    }, isLink: function(mode) {
      return (mode & 61440) === 40960;
    }, isChrdev: function(mode) {
      return (mode & 61440) === 8192;
    }, isBlkdev: function(mode) {
      return (mode & 61440) === 24576;
    }, isFIFO: function(mode) {
      return (mode & 61440) === 4096;
    }, isSocket: function(mode) {
      return (mode & 49152) === 49152;
    }, flagModes: {r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090}, modeStringToFlags: function(str) {
      var flags = FS.flagModes[str];
      if (typeof flags === "undefined") {
        throw new Error("Unknown file open mode: " + str);
      }
      return flags;
    }, flagsToPermissionString: function(flag) {
      var perms = ["r", "w", "rw"][flag & 3];
      if (flag & 512) {
        perms += "w";
      }
      return perms;
    }, nodePermissions: function(node, perms) {
      if (FS.ignorePermissions) {
        return 0;
      }
      if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
        return 2;
      } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
        return 2;
      } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
        return 2;
      }
      return 0;
    }, mayLookup: function(dir) {
      var errCode = FS.nodePermissions(dir, "x");
      if (errCode)
        return errCode;
      if (!dir.node_ops.lookup)
        return 2;
      return 0;
    }, mayCreate: function(dir, name) {
      try {
        var node = FS.lookupNode(dir, name);
        return 20;
      } catch (e) {
      }
      return FS.nodePermissions(dir, "wx");
    }, mayDelete: function(dir, name, isdir) {
      var node;
      try {
        node = FS.lookupNode(dir, name);
      } catch (e) {
        return e.errno;
      }
      var errCode = FS.nodePermissions(dir, "wx");
      if (errCode) {
        return errCode;
      }
      if (isdir) {
        if (!FS.isDir(node.mode)) {
          return 54;
        }
        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
          return 10;
        }
      } else {
        if (FS.isDir(node.mode)) {
          return 31;
        }
      }
      return 0;
    }, mayOpen: function(node, flags) {
      if (!node) {
        return 44;
      }
      if (FS.isLink(node.mode)) {
        return 32;
      } else if (FS.isDir(node.mode)) {
        if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
          return 31;
        }
      }
      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    }, MAX_OPEN_FDS: 4096, nextfd: function(fd_start, fd_end) {
      fd_start = fd_start || 0;
      fd_end = fd_end || FS.MAX_OPEN_FDS;
      for (var fd = fd_start; fd <= fd_end; fd++) {
        if (!FS.streams[fd]) {
          return fd;
        }
      }
      throw new FS.ErrnoError(33);
    }, getStream: function(fd) {
      return FS.streams[fd];
    }, createStream: function(stream, fd_start, fd_end) {
      if (!FS.FSStream) {
        FS.FSStream = function() {
        };
        FS.FSStream.prototype = {object: {get: function() {
          return this.node;
        }, set: function(val) {
          this.node = val;
        }}, isRead: {get: function() {
          return (this.flags & 2097155) !== 1;
        }}, isWrite: {get: function() {
          return (this.flags & 2097155) !== 0;
        }}, isAppend: {get: function() {
          return this.flags & 1024;
        }}};
      }
      var newStream = new FS.FSStream();
      for (var p in stream) {
        newStream[p] = stream[p];
      }
      stream = newStream;
      var fd = FS.nextfd(fd_start, fd_end);
      stream.fd = fd;
      FS.streams[fd] = stream;
      return stream;
    }, closeStream: function(fd) {
      FS.streams[fd] = null;
    }, chrdev_stream_ops: {open: function(stream) {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
    }, llseek: function() {
      throw new FS.ErrnoError(70);
    }}, major: function(dev) {
      return dev >> 8;
    }, minor: function(dev) {
      return dev & 255;
    }, makedev: function(ma, mi) {
      return ma << 8 | mi;
    }, registerDevice: function(dev, ops) {
      FS.devices[dev] = {stream_ops: ops};
    }, getDevice: function(dev) {
      return FS.devices[dev];
    }, getMounts: function(mount) {
      var mounts = [];
      var check = [mount];
      while (check.length) {
        var m = check.pop();
        mounts.push(m);
        check.push.apply(check, m.mounts);
      }
      return mounts;
    }, syncfs: function(populate, callback) {
      if (typeof populate === "function") {
        callback = populate;
        populate = false;
      }
      FS.syncFSRequests++;
      if (FS.syncFSRequests > 1) {
        err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
      }
      var mounts = FS.getMounts(FS.root.mount);
      var completed = 0;
      function doCallback(errCode) {
        FS.syncFSRequests--;
        return callback(errCode);
      }
      function done(errCode) {
        if (errCode) {
          if (!done.errored) {
            done.errored = true;
            return doCallback(errCode);
          }
          return;
        }
        if (++completed >= mounts.length) {
          doCallback(null);
        }
      }
      mounts.forEach(function(mount) {
        if (!mount.type.syncfs) {
          return done(null);
        }
        mount.type.syncfs(mount, populate, done);
      });
    }, mount: function(type, opts, mountpoint) {
      var root = mountpoint === "/";
      var pseudo = !mountpoint;
      var node;
      if (root && FS.root) {
        throw new FS.ErrnoError(10);
      } else if (!root && !pseudo) {
        var lookup = FS.lookupPath(mountpoint, {follow_mount: false});
        mountpoint = lookup.path;
        node = lookup.node;
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        if (!FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
      }
      var mount = {type, opts, mountpoint, mounts: []};
      var mountRoot = type.mount(mount);
      mountRoot.mount = mount;
      mount.root = mountRoot;
      if (root) {
        FS.root = mountRoot;
      } else if (node) {
        node.mounted = mount;
        if (node.mount) {
          node.mount.mounts.push(mount);
        }
      }
      return mountRoot;
    }, unmount: function(mountpoint) {
      var lookup = FS.lookupPath(mountpoint, {follow_mount: false});
      if (!FS.isMountpoint(lookup.node)) {
        throw new FS.ErrnoError(28);
      }
      var node = lookup.node;
      var mount = node.mounted;
      var mounts = FS.getMounts(mount);
      Object.keys(FS.nameTable).forEach(function(hash) {
        var current = FS.nameTable[hash];
        while (current) {
          var next = current.name_next;
          if (mounts.indexOf(current.mount) !== -1) {
            FS.destroyNode(current);
          }
          current = next;
        }
      });
      node.mounted = null;
      var idx = node.mount.mounts.indexOf(mount);
      node.mount.mounts.splice(idx, 1);
    }, lookup: function(parent, name) {
      return parent.node_ops.lookup(parent, name);
    }, mknod: function(path, mode, dev) {
      var lookup = FS.lookupPath(path, {parent: true});
      var parent = lookup.node;
      var name = PATH.basename(path);
      if (!name || name === "." || name === "..") {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.mayCreate(parent, name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.mknod) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.mknod(parent, name, mode, dev);
    }, create: function(path, mode) {
      mode = mode !== void 0 ? mode : 438;
      mode &= 4095;
      mode |= 32768;
      return FS.mknod(path, mode, 0);
    }, mkdir: function(path, mode) {
      mode = mode !== void 0 ? mode : 511;
      mode &= 511 | 512;
      mode |= 16384;
      return FS.mknod(path, mode, 0);
    }, mkdirTree: function(path, mode) {
      var dirs = path.split("/");
      var d = "";
      for (var i2 = 0; i2 < dirs.length; ++i2) {
        if (!dirs[i2])
          continue;
        d += "/" + dirs[i2];
        try {
          FS.mkdir(d, mode);
        } catch (e) {
          if (e.errno != 20)
            throw e;
        }
      }
    }, mkdev: function(path, mode, dev) {
      if (typeof dev === "undefined") {
        dev = mode;
        mode = 438;
      }
      mode |= 8192;
      return FS.mknod(path, mode, dev);
    }, symlink: function(oldpath, newpath) {
      if (!PATH_FS.resolve(oldpath)) {
        throw new FS.ErrnoError(44);
      }
      var lookup = FS.lookupPath(newpath, {parent: true});
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var newname = PATH.basename(newpath);
      var errCode = FS.mayCreate(parent, newname);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.symlink) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.symlink(parent, newname, oldpath);
    }, rename: function(old_path, new_path) {
      var old_dirname = PATH.dirname(old_path);
      var new_dirname = PATH.dirname(new_path);
      var old_name = PATH.basename(old_path);
      var new_name = PATH.basename(new_path);
      var lookup, old_dir, new_dir;
      lookup = FS.lookupPath(old_path, {parent: true});
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, {parent: true});
      new_dir = lookup.node;
      if (!old_dir || !new_dir)
        throw new FS.ErrnoError(44);
      if (old_dir.mount !== new_dir.mount) {
        throw new FS.ErrnoError(75);
      }
      var old_node = FS.lookupNode(old_dir, old_name);
      var relative = PATH_FS.relative(old_path, new_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(28);
      }
      relative = PATH_FS.relative(new_path, old_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(55);
      }
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {
      }
      if (old_node === new_node) {
        return;
      }
      var isdir = FS.isDir(old_node.mode);
      var errCode = FS.mayDelete(old_dir, old_name, isdir);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!old_dir.node_ops.rename) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
        throw new FS.ErrnoError(10);
      }
      if (new_dir !== old_dir) {
        errCode = FS.nodePermissions(old_dir, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      try {
        if (FS.trackingDelegate["willMovePath"]) {
          FS.trackingDelegate["willMovePath"](old_path, new_path);
        }
      } catch (e) {
        err("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
      }
      FS.hashRemoveNode(old_node);
      try {
        old_dir.node_ops.rename(old_node, new_dir, new_name);
      } catch (e) {
        throw e;
      } finally {
        FS.hashAddNode(old_node);
      }
      try {
        if (FS.trackingDelegate["onMovePath"])
          FS.trackingDelegate["onMovePath"](old_path, new_path);
      } catch (e) {
        err("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
      }
    }, rmdir: function(path) {
      var lookup = FS.lookupPath(path, {parent: true});
      var parent = lookup.node;
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, true);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.rmdir) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      try {
        if (FS.trackingDelegate["willDeletePath"]) {
          FS.trackingDelegate["willDeletePath"](path);
        }
      } catch (e) {
        err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
      }
      parent.node_ops.rmdir(parent, name);
      FS.destroyNode(node);
      try {
        if (FS.trackingDelegate["onDeletePath"])
          FS.trackingDelegate["onDeletePath"](path);
      } catch (e) {
        err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
      }
    }, readdir: function(path) {
      var lookup = FS.lookupPath(path, {follow: true});
      var node = lookup.node;
      if (!node.node_ops.readdir) {
        throw new FS.ErrnoError(54);
      }
      return node.node_ops.readdir(node);
    }, unlink: function(path) {
      var lookup = FS.lookupPath(path, {parent: true});
      var parent = lookup.node;
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, false);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.unlink) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      try {
        if (FS.trackingDelegate["willDeletePath"]) {
          FS.trackingDelegate["willDeletePath"](path);
        }
      } catch (e) {
        err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
      }
      parent.node_ops.unlink(parent, name);
      FS.destroyNode(node);
      try {
        if (FS.trackingDelegate["onDeletePath"])
          FS.trackingDelegate["onDeletePath"](path);
      } catch (e) {
        err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
      }
    }, readlink: function(path) {
      var lookup = FS.lookupPath(path);
      var link = lookup.node;
      if (!link) {
        throw new FS.ErrnoError(44);
      }
      if (!link.node_ops.readlink) {
        throw new FS.ErrnoError(28);
      }
      return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
    }, stat: function(path, dontFollow) {
      var lookup = FS.lookupPath(path, {follow: !dontFollow});
      var node = lookup.node;
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (!node.node_ops.getattr) {
        throw new FS.ErrnoError(63);
      }
      return node.node_ops.getattr(node);
    }, lstat: function(path) {
      return FS.stat(path, true);
    }, chmod: function(path, mode, dontFollow) {
      var node;
      if (typeof path === "string") {
        var lookup = FS.lookupPath(path, {follow: !dontFollow});
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, {mode: mode & 4095 | node.mode & ~4095, timestamp: Date.now()});
    }, lchmod: function(path, mode) {
      FS.chmod(path, mode, true);
    }, fchmod: function(fd, mode) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      FS.chmod(stream.node, mode);
    }, chown: function(path, uid, gid, dontFollow) {
      var node;
      if (typeof path === "string") {
        var lookup = FS.lookupPath(path, {follow: !dontFollow});
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, {timestamp: Date.now()});
    }, lchown: function(path, uid, gid) {
      FS.chown(path, uid, gid, true);
    }, fchown: function(fd, uid, gid) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      FS.chown(stream.node, uid, gid);
    }, truncate: function(path, len) {
      if (len < 0) {
        throw new FS.ErrnoError(28);
      }
      var node;
      if (typeof path === "string") {
        var lookup = FS.lookupPath(path, {follow: true});
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isDir(node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!FS.isFile(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.nodePermissions(node, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      node.node_ops.setattr(node, {size: len, timestamp: Date.now()});
    }, ftruncate: function(fd, len) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(28);
      }
      FS.truncate(stream.node, len);
    }, utime: function(path, atime, mtime) {
      var lookup = FS.lookupPath(path, {follow: true});
      var node = lookup.node;
      node.node_ops.setattr(node, {timestamp: Math.max(atime, mtime)});
    }, open: function(path, flags, mode, fd_start, fd_end) {
      if (path === "") {
        throw new FS.ErrnoError(44);
      }
      flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
      mode = typeof mode === "undefined" ? 438 : mode;
      if (flags & 64) {
        mode = mode & 4095 | 32768;
      } else {
        mode = 0;
      }
      var node;
      if (typeof path === "object") {
        node = path;
      } else {
        path = PATH.normalize(path);
        try {
          var lookup = FS.lookupPath(path, {follow: !(flags & 131072)});
          node = lookup.node;
        } catch (e) {
        }
      }
      var created = false;
      if (flags & 64) {
        if (node) {
          if (flags & 128) {
            throw new FS.ErrnoError(20);
          }
        } else {
          node = FS.mknod(path, mode, 0);
          created = true;
        }
      }
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (FS.isChrdev(node.mode)) {
        flags &= ~512;
      }
      if (flags & 65536 && !FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
      if (!created) {
        var errCode = FS.mayOpen(node, flags);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      if (flags & 512) {
        FS.truncate(node, 0);
      }
      flags &= ~(128 | 512 | 131072);
      var stream = FS.createStream({node, path: FS.getPath(node), flags, seekable: true, position: 0, stream_ops: node.stream_ops, ungotten: [], error: false}, fd_start, fd_end);
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
      if (Module2["logReadFiles"] && !(flags & 1)) {
        if (!FS.readFiles)
          FS.readFiles = {};
        if (!(path in FS.readFiles)) {
          FS.readFiles[path] = 1;
          err("FS.trackingDelegate error on read file: " + path);
        }
      }
      try {
        if (FS.trackingDelegate["onOpenFile"]) {
          var trackingFlags = 0;
          if ((flags & 2097155) !== 1) {
            trackingFlags |= FS.tracking.openFlags.READ;
          }
          if ((flags & 2097155) !== 0) {
            trackingFlags |= FS.tracking.openFlags.WRITE;
          }
          FS.trackingDelegate["onOpenFile"](path, trackingFlags);
        }
      } catch (e) {
        err("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message);
      }
      return stream;
    }, close: function(stream) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (stream.getdents)
        stream.getdents = null;
      try {
        if (stream.stream_ops.close) {
          stream.stream_ops.close(stream);
        }
      } catch (e) {
        throw e;
      } finally {
        FS.closeStream(stream.fd);
      }
      stream.fd = null;
    }, isClosed: function(stream) {
      return stream.fd === null;
    }, llseek: function(stream, offset, whence) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (!stream.seekable || !stream.stream_ops.llseek) {
        throw new FS.ErrnoError(70);
      }
      if (whence != 0 && whence != 1 && whence != 2) {
        throw new FS.ErrnoError(28);
      }
      stream.position = stream.stream_ops.llseek(stream, offset, whence);
      stream.ungotten = [];
      return stream.position;
    }, read: function(stream, buffer2, offset, length, position) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.read) {
        throw new FS.ErrnoError(28);
      }
      var seeking = typeof position !== "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesRead = stream.stream_ops.read(stream, buffer2, offset, length, position);
      if (!seeking)
        stream.position += bytesRead;
      return bytesRead;
    }, write: function(stream, buffer2, offset, length, position, canOwn) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.write) {
        throw new FS.ErrnoError(28);
      }
      if (stream.seekable && stream.flags & 1024) {
        FS.llseek(stream, 0, 2);
      }
      var seeking = typeof position !== "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesWritten = stream.stream_ops.write(stream, buffer2, offset, length, position, canOwn);
      if (!seeking)
        stream.position += bytesWritten;
      try {
        if (stream.path && FS.trackingDelegate["onWriteToFile"])
          FS.trackingDelegate["onWriteToFile"](stream.path);
      } catch (e) {
        err("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message);
      }
      return bytesWritten;
    }, allocate: function(stream, offset, length) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (offset < 0 || length <= 0) {
        throw new FS.ErrnoError(28);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (!stream.stream_ops.allocate) {
        throw new FS.ErrnoError(138);
      }
      stream.stream_ops.allocate(stream, offset, length);
    }, mmap: function(stream, address, length, position, prot, flags) {
      if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
        throw new FS.ErrnoError(2);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(2);
      }
      if (!stream.stream_ops.mmap) {
        throw new FS.ErrnoError(43);
      }
      return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
    }, msync: function(stream, buffer2, offset, length, mmapFlags) {
      if (!stream || !stream.stream_ops.msync) {
        return 0;
      }
      return stream.stream_ops.msync(stream, buffer2, offset, length, mmapFlags);
    }, munmap: function(stream) {
      return 0;
    }, ioctl: function(stream, cmd, arg) {
      if (!stream.stream_ops.ioctl) {
        throw new FS.ErrnoError(59);
      }
      return stream.stream_ops.ioctl(stream, cmd, arg);
    }, readFile: function(path, opts) {
      opts = opts || {};
      opts.flags = opts.flags || 0;
      opts.encoding = opts.encoding || "binary";
      if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
        throw new Error('Invalid encoding type "' + opts.encoding + '"');
      }
      var ret;
      var stream = FS.open(path, opts.flags);
      var stat = FS.stat(path);
      var length = stat.size;
      var buf = new Uint8Array(length);
      FS.read(stream, buf, 0, length, 0);
      if (opts.encoding === "utf8") {
        ret = UTF8ArrayToString(buf, 0);
      } else if (opts.encoding === "binary") {
        ret = buf;
      }
      FS.close(stream);
      return ret;
    }, writeFile: function(path, data, opts) {
      opts = opts || {};
      opts.flags = opts.flags || 577;
      var stream = FS.open(path, opts.flags, opts.mode);
      if (typeof data === "string") {
        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
        FS.write(stream, buf, 0, actualNumBytes, void 0, opts.canOwn);
      } else if (ArrayBuffer.isView(data)) {
        FS.write(stream, data, 0, data.byteLength, void 0, opts.canOwn);
      } else {
        throw new Error("Unsupported data type");
      }
      FS.close(stream);
    }, cwd: function() {
      return FS.currentPath;
    }, chdir: function(path) {
      var lookup = FS.lookupPath(path, {follow: true});
      if (lookup.node === null) {
        throw new FS.ErrnoError(44);
      }
      if (!FS.isDir(lookup.node.mode)) {
        throw new FS.ErrnoError(54);
      }
      var errCode = FS.nodePermissions(lookup.node, "x");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      FS.currentPath = lookup.path;
    }, createDefaultDirectories: function() {
      FS.mkdir("/tmp");
      FS.mkdir("/home");
      FS.mkdir("/home/web_user");
    }, createDefaultDevices: function() {
      FS.mkdir("/dev");
      FS.registerDevice(FS.makedev(1, 3), {read: function() {
        return 0;
      }, write: function(stream, buffer2, offset, length, pos) {
        return length;
      }});
      FS.mkdev("/dev/null", FS.makedev(1, 3));
      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
      FS.mkdev("/dev/tty", FS.makedev(5, 0));
      FS.mkdev("/dev/tty1", FS.makedev(6, 0));
      var random_device = getRandomDevice();
      FS.createDevice("/dev", "random", random_device);
      FS.createDevice("/dev", "urandom", random_device);
      FS.mkdir("/dev/shm");
      FS.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories: function() {
      FS.mkdir("/proc");
      var proc_self = FS.mkdir("/proc/self");
      FS.mkdir("/proc/self/fd");
      FS.mount({mount: function() {
        var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
        node.node_ops = {lookup: function(parent, name) {
          var fd = +name;
          var stream = FS.getStream(fd);
          if (!stream)
            throw new FS.ErrnoError(8);
          var ret = {parent: null, mount: {mountpoint: "fake"}, node_ops: {readlink: function() {
            return stream.path;
          }}};
          ret.parent = ret;
          return ret;
        }};
        return node;
      }}, {}, "/proc/self/fd");
    }, createStandardStreams: function() {
      if (Module2["stdin"]) {
        FS.createDevice("/dev", "stdin", Module2["stdin"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdin");
      }
      if (Module2["stdout"]) {
        FS.createDevice("/dev", "stdout", null, Module2["stdout"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdout");
      }
      if (Module2["stderr"]) {
        FS.createDevice("/dev", "stderr", null, Module2["stderr"]);
      } else {
        FS.symlink("/dev/tty1", "/dev/stderr");
      }
      var stdin = FS.open("/dev/stdin", 0);
      var stdout = FS.open("/dev/stdout", 1);
      var stderr = FS.open("/dev/stderr", 1);
    }, ensureErrnoError: function() {
      if (FS.ErrnoError)
        return;
      FS.ErrnoError = function ErrnoError(errno, node) {
        this.node = node;
        this.setErrno = function(errno2) {
          this.errno = errno2;
        };
        this.setErrno(errno);
        this.message = "FS error";
      };
      FS.ErrnoError.prototype = new Error();
      FS.ErrnoError.prototype.constructor = FS.ErrnoError;
      [44].forEach(function(code) {
        FS.genericErrors[code] = new FS.ErrnoError(code);
        FS.genericErrors[code].stack = "<generic error, no stack>";
      });
    }, staticInit: function() {
      FS.ensureErrnoError();
      FS.nameTable = new Array(4096);
      FS.mount(MEMFS, {}, "/");
      FS.createDefaultDirectories();
      FS.createDefaultDevices();
      FS.createSpecialDirectories();
      FS.filesystems = {MEMFS};
    }, init: function(input, output, error) {
      FS.init.initialized = true;
      FS.ensureErrnoError();
      Module2["stdin"] = input || Module2["stdin"];
      Module2["stdout"] = output || Module2["stdout"];
      Module2["stderr"] = error || Module2["stderr"];
      FS.createStandardStreams();
    }, quit: function() {
      FS.init.initialized = false;
      var fflush = Module2["_fflush"];
      if (fflush)
        fflush(0);
      for (var i2 = 0; i2 < FS.streams.length; i2++) {
        var stream = FS.streams[i2];
        if (!stream) {
          continue;
        }
        FS.close(stream);
      }
    }, getMode: function(canRead, canWrite) {
      var mode = 0;
      if (canRead)
        mode |= 292 | 73;
      if (canWrite)
        mode |= 146;
      return mode;
    }, findObject: function(path, dontResolveLastLink) {
      var ret = FS.analyzePath(path, dontResolveLastLink);
      if (ret.exists) {
        return ret.object;
      } else {
        return null;
      }
    }, analyzePath: function(path, dontResolveLastLink) {
      try {
        var lookup = FS.lookupPath(path, {follow: !dontResolveLastLink});
        path = lookup.path;
      } catch (e) {
      }
      var ret = {isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null};
      try {
        var lookup = FS.lookupPath(path, {parent: true});
        ret.parentExists = true;
        ret.parentPath = lookup.path;
        ret.parentObject = lookup.node;
        ret.name = PATH.basename(path);
        lookup = FS.lookupPath(path, {follow: !dontResolveLastLink});
        ret.exists = true;
        ret.path = lookup.path;
        ret.object = lookup.node;
        ret.name = lookup.node.name;
        ret.isRoot = lookup.path === "/";
      } catch (e) {
        ret.error = e.errno;
      }
      return ret;
    }, createPath: function(parent, path, canRead, canWrite) {
      parent = typeof parent === "string" ? parent : FS.getPath(parent);
      var parts = path.split("/").reverse();
      while (parts.length) {
        var part = parts.pop();
        if (!part)
          continue;
        var current = PATH.join2(parent, part);
        try {
          FS.mkdir(current);
        } catch (e) {
        }
        parent = current;
      }
      return current;
    }, createFile: function(parent, name, properties, canRead, canWrite) {
      var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
      var mode = FS.getMode(canRead, canWrite);
      return FS.create(path, mode);
    }, createDataFile: function(parent, name, data, canRead, canWrite, canOwn) {
      var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
      var mode = FS.getMode(canRead, canWrite);
      var node = FS.create(path, mode);
      if (data) {
        if (typeof data === "string") {
          var arr = new Array(data.length);
          for (var i2 = 0, len = data.length; i2 < len; ++i2)
            arr[i2] = data.charCodeAt(i2);
          data = arr;
        }
        FS.chmod(node, mode | 146);
        var stream = FS.open(node, 577);
        FS.write(stream, data, 0, data.length, 0, canOwn);
        FS.close(stream);
        FS.chmod(node, mode);
      }
      return node;
    }, createDevice: function(parent, name, input, output) {
      var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
      var mode = FS.getMode(!!input, !!output);
      if (!FS.createDevice.major)
        FS.createDevice.major = 64;
      var dev = FS.makedev(FS.createDevice.major++, 0);
      FS.registerDevice(dev, {open: function(stream) {
        stream.seekable = false;
      }, close: function(stream) {
        if (output && output.buffer && output.buffer.length) {
          output(10);
        }
      }, read: function(stream, buffer2, offset, length, pos) {
        var bytesRead = 0;
        for (var i2 = 0; i2 < length; i2++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === void 0 && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === void 0)
            break;
          bytesRead++;
          buffer2[offset + i2] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      }, write: function(stream, buffer2, offset, length, pos) {
        for (var i2 = 0; i2 < length; i2++) {
          try {
            output(buffer2[offset + i2]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i2;
      }});
      return FS.mkdev(path, mode, dev);
    }, forceLoadFile: function(obj) {
      if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
        return true;
      if (typeof XMLHttpRequest !== "undefined") {
        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
      } else if (read_) {
        try {
          obj.contents = intArrayFromString(read_(obj.url), true);
          obj.usedBytes = obj.contents.length;
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
      } else {
        throw new Error("Cannot load without read() or XMLHttpRequest.");
      }
    }, createLazyFile: function(parent, name, url, canRead, canWrite) {
      function LazyUint8Array() {
        this.lengthKnown = false;
        this.chunks = [];
      }
      LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
        if (idx > this.length - 1 || idx < 0) {
          return void 0;
        }
        var chunkOffset = idx % this.chunkSize;
        var chunkNum = idx / this.chunkSize | 0;
        return this.getter(chunkNum)[chunkOffset];
      };
      LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
        this.getter = getter;
      };
      LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, false);
        xhr.send(null);
        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
          throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
        var datalength = Number(xhr.getResponseHeader("Content-length"));
        var header;
        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
        var chunkSize = 1024 * 1024;
        if (!hasByteServing)
          chunkSize = datalength;
        var doXHR = function(from, to) {
          if (from > to)
            throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
          if (to > datalength - 1)
            throw new Error("only " + datalength + " bytes available! programmer error!");
          var xhr2 = new XMLHttpRequest();
          xhr2.open("GET", url, false);
          if (datalength !== chunkSize)
            xhr2.setRequestHeader("Range", "bytes=" + from + "-" + to);
          if (typeof Uint8Array != "undefined")
            xhr2.responseType = "arraybuffer";
          if (xhr2.overrideMimeType) {
            xhr2.overrideMimeType("text/plain; charset=x-user-defined");
          }
          xhr2.send(null);
          if (!(xhr2.status >= 200 && xhr2.status < 300 || xhr2.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr2.status);
          if (xhr2.response !== void 0) {
            return new Uint8Array(xhr2.response || []);
          } else {
            return intArrayFromString(xhr2.responseText || "", true);
          }
        };
        var lazyArray2 = this;
        lazyArray2.setDataGetter(function(chunkNum) {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1;
          end = Math.min(end, datalength - 1);
          if (typeof lazyArray2.chunks[chunkNum] === "undefined") {
            lazyArray2.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray2.chunks[chunkNum] === "undefined")
            throw new Error("doXHR failed!");
          return lazyArray2.chunks[chunkNum];
        });
        if (usesGzip || !datalength) {
          chunkSize = datalength = 1;
          datalength = this.getter(0).length;
          chunkSize = datalength;
          out("LazyFiles on gzip forces download of the whole file when length is accessed");
        }
        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      };
      if (typeof XMLHttpRequest !== "undefined") {
        throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
      } else {
        var properties = {isDevice: false, url};
      }
      var node = FS.createFile(parent, name, properties, canRead, canWrite);
      if (properties.contents) {
        node.contents = properties.contents;
      } else if (properties.url) {
        node.contents = null;
        node.url = properties.url;
      }
      Object.defineProperties(node, {usedBytes: {get: function() {
        return this.contents.length;
      }}});
      var stream_ops = {};
      var keys = Object.keys(node.stream_ops);
      keys.forEach(function(key2) {
        var fn = node.stream_ops[key2];
        stream_ops[key2] = function forceLoadLazyFile() {
          FS.forceLoadFile(node);
          return fn.apply(null, arguments);
        };
      });
      stream_ops.read = function stream_ops_read(stream, buffer2, offset, length, position) {
        FS.forceLoadFile(node);
        var contents = stream.node.contents;
        if (position >= contents.length)
          return 0;
        var size = Math.min(contents.length - position, length);
        if (contents.slice) {
          for (var i2 = 0; i2 < size; i2++) {
            buffer2[offset + i2] = contents[position + i2];
          }
        } else {
          for (var i2 = 0; i2 < size; i2++) {
            buffer2[offset + i2] = contents.get(position + i2);
          }
        }
        return size;
      };
      node.stream_ops = stream_ops;
      return node;
    }, createPreloadedFile: function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
      Browser.init();
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      function processData(byteArray) {
        function finish(byteArray2) {
          if (preFinish)
            preFinish();
          if (!dontCreateFile) {
            FS.createDataFile(parent, name, byteArray2, canRead, canWrite, canOwn);
          }
          if (onload)
            onload();
          removeRunDependency();
        }
        var handled = false;
        Module2["preloadPlugins"].forEach(function(plugin) {
          if (handled)
            return;
          if (plugin["canHandle"](fullname)) {
            plugin["handle"](byteArray, fullname, finish, function() {
              if (onerror)
                onerror();
              removeRunDependency();
            });
            handled = true;
          }
        });
        if (!handled)
          finish(byteArray);
      }
      addRunDependency();
      if (typeof url == "string") {
        Browser.asyncLoad(url, function(byteArray) {
          processData(byteArray);
        }, onerror);
      } else {
        processData(url);
      }
    }, indexedDB: function() {
      return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }, DB_NAME: function() {
      return "EM_FS_" + window.location.pathname;
    }, DB_VERSION: 20, DB_STORE_NAME: "FILE_DATA", saveFilesToDB: function(paths, onload, onerror) {
      onload = onload || function() {
      };
      onerror = onerror || function() {
      };
      var indexedDB = FS.indexedDB();
      try {
        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
      } catch (e) {
        return onerror(e);
      }
      openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
        out("creating db");
        var db = openRequest.result;
        db.createObjectStore(FS.DB_STORE_NAME);
      };
      openRequest.onsuccess = function openRequest_onsuccess() {
        var db = openRequest.result;
        var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
        var files = transaction.objectStore(FS.DB_STORE_NAME);
        var ok = 0, fail = 0, total = paths.length;
        function finish() {
          if (fail == 0)
            onload();
          else
            onerror();
        }
        paths.forEach(function(path) {
          var putRequest = files.put(FS.analyzePath(path).object.contents, path);
          putRequest.onsuccess = function putRequest_onsuccess() {
            ok++;
            if (ok + fail == total)
              finish();
          };
          putRequest.onerror = function putRequest_onerror() {
            fail++;
            if (ok + fail == total)
              finish();
          };
        });
        transaction.onerror = onerror;
      };
      openRequest.onerror = onerror;
    }, loadFilesFromDB: function(paths, onload, onerror) {
      onload = onload || function() {
      };
      onerror = onerror || function() {
      };
      var indexedDB = FS.indexedDB();
      try {
        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
      } catch (e) {
        return onerror(e);
      }
      openRequest.onupgradeneeded = onerror;
      openRequest.onsuccess = function openRequest_onsuccess() {
        var db = openRequest.result;
        try {
          var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
        } catch (e) {
          onerror(e);
          return;
        }
        var files = transaction.objectStore(FS.DB_STORE_NAME);
        var ok = 0, fail = 0, total = paths.length;
        function finish() {
          if (fail == 0)
            onload();
          else
            onerror();
        }
        paths.forEach(function(path) {
          var getRequest = files.get(path);
          getRequest.onsuccess = function getRequest_onsuccess() {
            if (FS.analyzePath(path).exists) {
              FS.unlink(path);
            }
            FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
            ok++;
            if (ok + fail == total)
              finish();
          };
          getRequest.onerror = function getRequest_onerror() {
            fail++;
            if (ok + fail == total)
              finish();
          };
        });
        transaction.onerror = onerror;
      };
      openRequest.onerror = onerror;
    }};
    var SYSCALLS = {mappings: {}, DEFAULT_POLLMASK: 5, umask: 511, calculateAt: function(dirfd, path, allowEmpty) {
      if (path[0] === "/") {
        return path;
      }
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = FS.getStream(dirfd);
        if (!dirstream)
          throw new FS.ErrnoError(8);
        dir = dirstream.path;
      }
      if (path.length == 0) {
        if (!allowEmpty) {
          throw new FS.ErrnoError(44);
        }
        return dir;
      }
      return PATH.join2(dir, path);
    }, doStat: function(func, path, buf) {
      try {
        var stat = func(path);
      } catch (e) {
        if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
          return -54;
        }
        throw e;
      }
      HEAP32[buf >> 2] = stat.dev;
      HEAP32[buf + 4 >> 2] = 0;
      HEAP32[buf + 8 >> 2] = stat.ino;
      HEAP32[buf + 12 >> 2] = stat.mode;
      HEAP32[buf + 16 >> 2] = stat.nlink;
      HEAP32[buf + 20 >> 2] = stat.uid;
      HEAP32[buf + 24 >> 2] = stat.gid;
      HEAP32[buf + 28 >> 2] = stat.rdev;
      HEAP32[buf + 32 >> 2] = 0;
      tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
      HEAP32[buf + 48 >> 2] = 4096;
      HEAP32[buf + 52 >> 2] = stat.blocks;
      HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
      HEAP32[buf + 60 >> 2] = 0;
      HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
      HEAP32[buf + 68 >> 2] = 0;
      HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
      HEAP32[buf + 76 >> 2] = 0;
      tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
      return 0;
    }, doMsync: function(addr, stream, len, flags, offset) {
      var buffer2 = HEAPU8.slice(addr, addr + len);
      FS.msync(stream, buffer2, offset, len, flags);
    }, doMkdir: function(path, mode) {
      path = PATH.normalize(path);
      if (path[path.length - 1] === "/")
        path = path.substr(0, path.length - 1);
      FS.mkdir(path, mode, 0);
      return 0;
    }, doMknod: function(path, mode, dev) {
      switch (mode & 61440) {
        case 32768:
        case 8192:
        case 24576:
        case 4096:
        case 49152:
          break;
        default:
          return -28;
      }
      FS.mknod(path, mode, dev);
      return 0;
    }, doReadlink: function(path, buf, bufsize) {
      if (bufsize <= 0)
        return -28;
      var ret = FS.readlink(path);
      var len = Math.min(bufsize, lengthBytesUTF8(ret));
      var endChar = HEAP8[buf + len];
      stringToUTF8(ret, buf, bufsize + 1);
      HEAP8[buf + len] = endChar;
      return len;
    }, doAccess: function(path, amode) {
      if (amode & ~7) {
        return -28;
      }
      var node;
      var lookup = FS.lookupPath(path, {follow: true});
      node = lookup.node;
      if (!node) {
        return -44;
      }
      var perms = "";
      if (amode & 4)
        perms += "r";
      if (amode & 2)
        perms += "w";
      if (amode & 1)
        perms += "x";
      if (perms && FS.nodePermissions(node, perms)) {
        return -2;
      }
      return 0;
    }, doDup: function(path, flags, suggestFD) {
      var suggest = FS.getStream(suggestFD);
      if (suggest)
        FS.close(suggest);
      return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
    }, doReadv: function(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i2 = 0; i2 < iovcnt; i2++) {
        var ptr = HEAP32[iov + i2 * 8 >> 2];
        var len = HEAP32[iov + (i2 * 8 + 4) >> 2];
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0)
          return -1;
        ret += curr;
        if (curr < len)
          break;
      }
      return ret;
    }, doWritev: function(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i2 = 0; i2 < iovcnt; i2++) {
        var ptr = HEAP32[iov + i2 * 8 >> 2];
        var len = HEAP32[iov + (i2 * 8 + 4) >> 2];
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0)
          return -1;
        ret += curr;
      }
      return ret;
    }, varargs: void 0, get: function() {
      SYSCALLS.varargs += 4;
      var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
      return ret;
    }, getStr: function(ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    }, getStreamFromFD: function(fd) {
      var stream = FS.getStream(fd);
      if (!stream)
        throw new FS.ErrnoError(8);
      return stream;
    }, get64: function(low, high) {
      return low;
    }};
    function ___sys_access(path, amode) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doAccess(path, amode);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function setErrNo(value) {
      HEAP32[___errno_location() >> 2] = value;
      return value;
    }
    function ___sys_fcntl64(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
          case 0: {
            var arg = SYSCALLS.get();
            if (arg < 0) {
              return -28;
            }
            var newStream;
            newStream = FS.open(stream.path, stream.flags, 0, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return stream.flags;
          case 4: {
            var arg = SYSCALLS.get();
            stream.flags |= arg;
            return 0;
          }
          case 12: {
            var arg = SYSCALLS.get();
            var offset = 0;
            HEAP16[arg + offset >> 1] = 2;
            return 0;
          }
          case 13:
          case 14:
            return 0;
          case 16:
          case 8:
            return -28;
          case 9:
            setErrNo(28);
            return -1;
          default: {
            return -28;
          }
        }
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___sys_fstat64(fd, buf) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        return SYSCALLS.doStat(FS.stat, stream.path, buf);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___sys_fstatat64(dirfd, path, buf, flags) {
      try {
        path = SYSCALLS.getStr(path);
        var nofollow = flags & 256;
        var allowEmpty = flags & 4096;
        flags = flags & ~4352;
        path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
        return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___sys_getdents64(fd, dirp, count) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (!stream.getdents) {
          stream.getdents = FS.readdir(stream.path);
        }
        var struct_size = 280;
        var pos = 0;
        var off = FS.llseek(stream, 0, 1);
        var idx = Math.floor(off / struct_size);
        while (idx < stream.getdents.length && pos + struct_size <= count) {
          var id;
          var type;
          var name = stream.getdents[idx];
          if (name[0] === ".") {
            id = 1;
            type = 4;
          } else {
            var child = FS.lookupNode(stream.node, name);
            id = child.id;
            type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
          }
          tempI64 = [id >>> 0, (tempDouble = id, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
          tempI64 = [(idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
          HEAP16[dirp + pos + 16 >> 1] = 280;
          HEAP8[dirp + pos + 18 >> 0] = type;
          stringToUTF8(name, dirp + pos + 19, 256);
          pos += struct_size;
          idx += 1;
        }
        FS.llseek(stream, idx * struct_size, 0);
        return pos;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___sys_ioctl(fd, op, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
          case 21509:
          case 21505: {
            if (!stream.tty)
              return -59;
            return 0;
          }
          case 21510:
          case 21511:
          case 21512:
          case 21506:
          case 21507:
          case 21508: {
            if (!stream.tty)
              return -59;
            return 0;
          }
          case 21519: {
            if (!stream.tty)
              return -59;
            var argp = SYSCALLS.get();
            HEAP32[argp >> 2] = 0;
            return 0;
          }
          case 21520: {
            if (!stream.tty)
              return -59;
            return -28;
          }
          case 21531: {
            var argp = SYSCALLS.get();
            return FS.ioctl(stream, op, argp);
          }
          case 21523: {
            if (!stream.tty)
              return -59;
            return 0;
          }
          case 21524: {
            if (!stream.tty)
              return -59;
            return 0;
          }
          default:
            abort("bad ioctl syscall " + op);
        }
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___sys_mkdir(path, mode) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doMkdir(path, mode);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function syscallMmap2(addr, len, prot, flags, fd, off) {
      off <<= 12;
      var ptr;
      var allocated = false;
      if ((flags & 16) !== 0 && addr % 16384 !== 0) {
        return -28;
      }
      if ((flags & 32) !== 0) {
        ptr = _memalign(16384, len);
        if (!ptr)
          return -48;
        _memset(ptr, 0, len);
        allocated = true;
      } else {
        var info = FS.getStream(fd);
        if (!info)
          return -8;
        var res = FS.mmap(info, addr, len, off, prot, flags);
        ptr = res.ptr;
        allocated = res.allocated;
      }
      SYSCALLS.mappings[ptr] = {malloc: ptr, len, allocated, fd, prot, flags, offset: off};
      return ptr;
    }
    function ___sys_mmap2(addr, len, prot, flags, fd, off) {
      try {
        return syscallMmap2(addr, len, prot, flags, fd, off);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function syscallMunmap(addr, len) {
      if ((addr | 0) === -1 || len === 0) {
        return -28;
      }
      var info = SYSCALLS.mappings[addr];
      if (!info)
        return 0;
      if (len === info.len) {
        var stream = FS.getStream(info.fd);
        if (stream) {
          if (info.prot & 2) {
            SYSCALLS.doMsync(addr, stream, len, info.flags, info.offset);
          }
          FS.munmap(stream);
        }
        SYSCALLS.mappings[addr] = null;
        if (info.allocated) {
          _free(info.malloc);
        }
      }
      return 0;
    }
    function ___sys_munmap(addr, len) {
      try {
        return syscallMunmap(addr, len);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___sys_open(path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var pathname = SYSCALLS.getStr(path);
        var mode = varargs ? SYSCALLS.get() : 0;
        var stream = FS.open(pathname, flags, mode);
        return stream.fd;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___sys_rmdir(path) {
      try {
        path = SYSCALLS.getStr(path);
        FS.rmdir(path);
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___sys_stat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doStat(FS.stat, path, buf);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___sys_unlink(path) {
      try {
        path = SYSCALLS.getStr(path);
        FS.unlink(path);
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function getShiftFromSize(size) {
      switch (size) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + size);
      }
    }
    function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i2 = 0; i2 < 256; ++i2) {
        codes[i2] = String.fromCharCode(i2);
      }
      embind_charCodes = codes;
    }
    var embind_charCodes = void 0;
    function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
    var awaitingDependencies = {};
    var registeredTypes = {};
    var typeDependencies = {};
    var char_0 = 48;
    var char_9 = 57;
    function makeLegalFunctionName(name) {
      if (name === void 0) {
        return "_unknown";
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, "$");
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return "_" + name;
      } else {
        return name;
      }
    }
    function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      return new Function("body", "return function " + name + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n')(body);
    }
    function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
        var stack = new Error(message).stack;
        if (stack !== void 0) {
          this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
        }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
        if (this.message === void 0) {
          return this.name;
        } else {
          return this.name + ": " + this.message;
        }
      };
      return errorClass;
    }
    var BindingError = void 0;
    function throwBindingError(message) {
      throw new BindingError(message);
    }
    var InternalError = void 0;
    function throwInternalError(message) {
      throw new InternalError(message);
    }
    function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
      myTypes.forEach(function(type) {
        typeDependencies[type] = dependentTypes;
      });
      function onComplete(typeConverters2) {
        var myTypeConverters = getTypeConverters(typeConverters2);
        if (myTypeConverters.length !== myTypes.length) {
          throwInternalError("Mismatched type converter count");
        }
        for (var i2 = 0; i2 < myTypes.length; ++i2) {
          registerType(myTypes[i2], myTypeConverters[i2]);
        }
      }
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach(function(dt, i2) {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i2] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(function() {
            typeConverters[i2] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (unregisteredTypes.length === 0) {
        onComplete(typeConverters);
      }
    }
    function registerType(rawType, registeredInstance, options) {
      options = options || {};
      if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError("registerType registeredInstance requires argPackAdvance");
      }
      var name = registeredInstance.name;
      if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
          return;
        } else {
          throwBindingError("Cannot register type '" + name + "' twice");
        }
      }
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function(cb) {
          cb();
        });
      }
    }
    function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {name, fromWireType: function(wt) {
        return !!wt;
      }, toWireType: function(destructors, o) {
        return o ? trueValue : falseValue;
      }, argPackAdvance: 8, readValueFromPointer: function(pointer) {
        var heap;
        if (size === 1) {
          heap = HEAP8;
        } else if (size === 2) {
          heap = HEAP16;
        } else if (size === 4) {
          heap = HEAP32;
        } else {
          throw new TypeError("Unknown boolean type size: " + name);
        }
        return this["fromWireType"](heap[pointer >> shift]);
      }, destructorFunction: null});
    }
    var emval_free_list = [];
    var emval_handle_array = [{}, {value: void 0}, {value: null}, {value: true}, {value: false}];
    function __emval_decref(handle) {
      if (handle > 4 && --emval_handle_array[handle].refcount === 0) {
        emval_handle_array[handle] = void 0;
        emval_free_list.push(handle);
      }
    }
    function count_emval_handles() {
      var count = 0;
      for (var i2 = 5; i2 < emval_handle_array.length; ++i2) {
        if (emval_handle_array[i2] !== void 0) {
          ++count;
        }
      }
      return count;
    }
    function get_first_emval() {
      for (var i2 = 5; i2 < emval_handle_array.length; ++i2) {
        if (emval_handle_array[i2] !== void 0) {
          return emval_handle_array[i2];
        }
      }
      return null;
    }
    function init_emval() {
      Module2["count_emval_handles"] = count_emval_handles;
      Module2["get_first_emval"] = get_first_emval;
    }
    function __emval_register(value) {
      switch (value) {
        case void 0: {
          return 1;
        }
        case null: {
          return 2;
        }
        case true: {
          return 3;
        }
        case false: {
          return 4;
        }
        default: {
          var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
          emval_handle_array[handle] = {refcount: 1, value};
          return handle;
        }
      }
    }
    function simpleReadValueFromPointer(pointer) {
      return this["fromWireType"](HEAPU32[pointer >> 2]);
    }
    function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {name, fromWireType: function(handle) {
        var rv = emval_handle_array[handle].value;
        __emval_decref(handle);
        return rv;
      }, toWireType: function(destructors, value) {
        return __emval_register(value);
      }, argPackAdvance: 8, readValueFromPointer: simpleReadValueFromPointer, destructorFunction: null});
    }
    function _embind_repr(v) {
      if (v === null) {
        return "null";
      }
      var t = typeof v;
      if (t === "object" || t === "array" || t === "function") {
        return v.toString();
      } else {
        return "" + v;
      }
    }
    function floatReadValueFromPointer(name, shift) {
      switch (shift) {
        case 2:
          return function(pointer) {
            return this["fromWireType"](HEAPF32[pointer >> 2]);
          };
        case 3:
          return function(pointer) {
            return this["fromWireType"](HEAPF64[pointer >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + name);
      }
    }
    function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {name, fromWireType: function(value) {
        return value;
      }, toWireType: function(destructors, value) {
        if (typeof value !== "number" && typeof value !== "boolean") {
          throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
        }
        return value;
      }, argPackAdvance: 8, readValueFromPointer: floatReadValueFromPointer(name, shift), destructorFunction: null});
    }
    function new_(constructor, argumentList) {
      if (!(constructor instanceof Function)) {
        throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function");
      }
      var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function() {
      });
      dummy.prototype = constructor.prototype;
      var obj = new dummy();
      var r = constructor.apply(obj, argumentList);
      return r instanceof Object ? r : obj;
    }
    function runDestructors(destructors) {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    }
    function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
      var argCount = argTypes.length;
      if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
      }
      var isClassMethodFunc = argTypes[1] !== null && classType !== null;
      var needsDestructorStack = false;
      for (var i2 = 1; i2 < argTypes.length; ++i2) {
        if (argTypes[i2] !== null && argTypes[i2].destructorFunction === void 0) {
          needsDestructorStack = true;
          break;
        }
      }
      var returns = argTypes[0].name !== "void";
      var argsList = "";
      var argsListWired = "";
      for (var i2 = 0; i2 < argCount - 2; ++i2) {
        argsList += (i2 !== 0 ? ", " : "") + "arg" + i2;
        argsListWired += (i2 !== 0 ? ", " : "") + "arg" + i2 + "Wired";
      }
      var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\nif (arguments.length !== " + (argCount - 2) + ") {\nthrowBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n}\n";
      if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
      }
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
      var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
      if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
      }
      for (var i2 = 0; i2 < argCount - 2; ++i2) {
        invokerFnBody += "var arg" + i2 + "Wired = argType" + i2 + ".toWireType(" + dtorStack + ", arg" + i2 + "); // " + argTypes[i2 + 2].name + "\n";
        args1.push("argType" + i2);
        args2.push(argTypes[i2 + 2]);
      }
      if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
      }
      invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
      if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
      } else {
        for (var i2 = isClassMethodFunc ? 1 : 2; i2 < argTypes.length; ++i2) {
          var paramName = i2 === 1 ? "thisWired" : "arg" + (i2 - 2) + "Wired";
          if (argTypes[i2].destructorFunction !== null) {
            invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i2].name + "\n";
            args1.push(paramName + "_dtor");
            args2.push(argTypes[i2].destructorFunction);
          }
        }
      }
      if (returns) {
        invokerFnBody += "var ret = retType.fromWireType(rv);\nreturn ret;\n";
      }
      invokerFnBody += "}\n";
      args1.push(invokerFnBody);
      var invokerFunction = new_(Function, args1).apply(null, args2);
      return invokerFunction;
    }
    function ensureOverloadTable(proto, methodName, humanName) {
      if (proto[methodName].overloadTable === void 0) {
        var prevFunc = proto[methodName];
        proto[methodName] = function() {
          if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
            throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
          }
          return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    }
    function exposePublicSymbol(name, value, numArguments) {
      if (Module2.hasOwnProperty(name)) {
        if (numArguments === void 0 || Module2[name].overloadTable !== void 0 && Module2[name].overloadTable[numArguments] !== void 0) {
          throwBindingError("Cannot register public name '" + name + "' twice");
        }
        ensureOverloadTable(Module2, name, name);
        if (Module2.hasOwnProperty(numArguments)) {
          throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        Module2[name].overloadTable[numArguments] = value;
      } else {
        Module2[name] = value;
        if (numArguments !== void 0) {
          Module2[name].numArguments = numArguments;
        }
      }
    }
    function heap32VectorToArray(count, firstElement) {
      var array = [];
      for (var i2 = 0; i2 < count; i2++) {
        array.push(HEAP32[(firstElement >> 2) + i2]);
      }
      return array;
    }
    function replacePublicSymbol(name, value, numArguments) {
      if (!Module2.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol");
      }
      if (Module2[name].overloadTable !== void 0 && numArguments !== void 0) {
        Module2[name].overloadTable[numArguments] = value;
      } else {
        Module2[name] = value;
        Module2[name].argCount = numArguments;
      }
    }
    function getDynCaller(sig, ptr) {
      var argCache = [];
      return function() {
        argCache.length = arguments.length;
        for (var i2 = 0; i2 < arguments.length; i2++) {
          argCache[i2] = arguments[i2];
        }
        return dynCall(sig, ptr, argCache);
      };
    }
    function embind__requireFunction(signature, rawFunction) {
      signature = readLatin1String(signature);
      function makeDynCaller() {
        if (signature.indexOf("j") != -1) {
          return getDynCaller(signature, rawFunction);
        }
        return wasmTable.get(rawFunction);
      }
      var fp = makeDynCaller();
      if (typeof fp !== "function") {
        throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
      }
      return fp;
    }
    var UnboundTypeError = void 0;
    function getTypeName(type) {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv;
    }
    function throwUnboundTypeError(message, types) {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
      throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
    }
    function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
      var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      name = readLatin1String(name);
      rawInvoker = embind__requireFunction(signature, rawInvoker);
      exposePublicSymbol(name, function() {
        throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes);
      }, argCount - 1);
      whenDependentTypesAreResolved([], argTypes, function(argTypes2) {
        var invokerArgsArray = [argTypes2[0], null].concat(argTypes2.slice(1));
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
        return [];
      });
    }
    function integerReadValueFromPointer(name, shift, signed) {
      switch (shift) {
        case 0:
          return signed ? function readS8FromPointer(pointer) {
            return HEAP8[pointer];
          } : function readU8FromPointer(pointer) {
            return HEAPU8[pointer];
          };
        case 1:
          return signed ? function readS16FromPointer(pointer) {
            return HEAP16[pointer >> 1];
          } : function readU16FromPointer(pointer) {
            return HEAPU16[pointer >> 1];
          };
        case 2:
          return signed ? function readS32FromPointer(pointer) {
            return HEAP32[pointer >> 2];
          } : function readU32FromPointer(pointer) {
            return HEAPU32[pointer >> 2];
          };
        default:
          throw new TypeError("Unknown integer type: " + name);
      }
    }
    function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
      name = readLatin1String(name);
      if (maxRange === -1) {
        maxRange = 4294967295;
      }
      var shift = getShiftFromSize(size);
      var fromWireType = function(value) {
        return value;
      };
      if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = function(value) {
          return value << bitshift >>> bitshift;
        };
      }
      var isUnsignedType = name.indexOf("unsigned") != -1;
      registerType(primitiveType, {name, fromWireType, toWireType: function(destructors, value) {
        if (typeof value !== "number" && typeof value !== "boolean") {
          throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
        }
        if (value < minRange || value > maxRange) {
          throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!");
        }
        return isUnsignedType ? value >>> 0 : value | 0;
      }, argPackAdvance: 8, readValueFromPointer: integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null});
    }
    function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
      var TA = typeMapping[dataTypeIndex];
      function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle];
        var data = heap[handle + 1];
        return new TA(buffer, data, size);
      }
      name = readLatin1String(name);
      registerType(rawType, {name, fromWireType: decodeMemoryView, argPackAdvance: 8, readValueFromPointer: decodeMemoryView}, {ignoreDuplicateRegistrations: true});
    }
    function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8 = name === "std::string";
      registerType(rawType, {name, fromWireType: function(value) {
        var length = HEAPU32[value >> 2];
        var str;
        if (stdStringIsUTF8) {
          var decodeStartPtr = value + 4;
          for (var i2 = 0; i2 <= length; ++i2) {
            var currentBytePtr = value + 4 + i2;
            if (i2 == length || HEAPU8[currentBytePtr] == 0) {
              var maxRead = currentBytePtr - decodeStartPtr;
              var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
              if (str === void 0) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + 1;
            }
          }
        } else {
          var a = new Array(length);
          for (var i2 = 0; i2 < length; ++i2) {
            a[i2] = String.fromCharCode(HEAPU8[value + 4 + i2]);
          }
          str = a.join("");
        }
        _free(value);
        return str;
      }, toWireType: function(destructors, value) {
        if (value instanceof ArrayBuffer) {
          value = new Uint8Array(value);
        }
        var getLength;
        var valueIsOfTypeString = typeof value === "string";
        if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
          throwBindingError("Cannot pass non-string to std::string");
        }
        if (stdStringIsUTF8 && valueIsOfTypeString) {
          getLength = function() {
            return lengthBytesUTF8(value);
          };
        } else {
          getLength = function() {
            return value.length;
          };
        }
        var length = getLength();
        var ptr = _malloc(4 + length + 1);
        HEAPU32[ptr >> 2] = length;
        if (stdStringIsUTF8 && valueIsOfTypeString) {
          stringToUTF8(value, ptr + 4, length + 1);
        } else {
          if (valueIsOfTypeString) {
            for (var i2 = 0; i2 < length; ++i2) {
              var charCode = value.charCodeAt(i2);
              if (charCode > 255) {
                _free(ptr);
                throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
              }
              HEAPU8[ptr + 4 + i2] = charCode;
            }
          } else {
            for (var i2 = 0; i2 < length; ++i2) {
              HEAPU8[ptr + 4 + i2] = value[i2];
            }
          }
        }
        if (destructors !== null) {
          destructors.push(_free, ptr);
        }
        return ptr;
      }, argPackAdvance: 8, readValueFromPointer: simpleReadValueFromPointer, destructorFunction: function(ptr) {
        _free(ptr);
      }});
    }
    function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        getHeap = function() {
          return HEAPU16;
        };
        shift = 1;
      } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        getHeap = function() {
          return HEAPU32;
        };
        shift = 2;
      }
      registerType(rawType, {name, fromWireType: function(value) {
        var length = HEAPU32[value >> 2];
        var HEAP = getHeap();
        var str;
        var decodeStartPtr = value + 4;
        for (var i2 = 0; i2 <= length; ++i2) {
          var currentBytePtr = value + 4 + i2 * charSize;
          if (i2 == length || HEAP[currentBytePtr >> shift] == 0) {
            var maxReadBytes = currentBytePtr - decodeStartPtr;
            var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
            if (str === void 0) {
              str = stringSegment;
            } else {
              str += String.fromCharCode(0);
              str += stringSegment;
            }
            decodeStartPtr = currentBytePtr + charSize;
          }
        }
        _free(value);
        return str;
      }, toWireType: function(destructors, value) {
        if (!(typeof value === "string")) {
          throwBindingError("Cannot pass non-string to C++ string type " + name);
        }
        var length = lengthBytesUTF(value);
        var ptr = _malloc(4 + length + charSize);
        HEAPU32[ptr >> 2] = length >> shift;
        encodeString(value, ptr + 4, length + charSize);
        if (destructors !== null) {
          destructors.push(_free, ptr);
        }
        return ptr;
      }, argPackAdvance: 8, readValueFromPointer: simpleReadValueFromPointer, destructorFunction: function(ptr) {
        _free(ptr);
      }});
    }
    function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {isVoid: true, name, argPackAdvance: 0, fromWireType: function() {
        return void 0;
      }, toWireType: function(destructors, o) {
        return void 0;
      }});
    }
    function requireHandle(handle) {
      if (!handle) {
        throwBindingError("Cannot use deleted val. handle = " + handle);
      }
      return emval_handle_array[handle].value;
    }
    function requireRegisteredType(rawType, humanName) {
      var impl = registeredTypes[rawType];
      if (impl === void 0) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
      }
      return impl;
    }
    function __emval_as(handle, returnType, destructorsRef) {
      handle = requireHandle(handle);
      returnType = requireRegisteredType(returnType, "emval::as");
      var destructors = [];
      var rd = __emval_register(destructors);
      HEAP32[destructorsRef >> 2] = rd;
      return returnType["toWireType"](destructors, handle);
    }
    function __emval_lookupTypes(argCount, argTypes) {
      var a = new Array(argCount);
      for (var i2 = 0; i2 < argCount; ++i2) {
        a[i2] = requireRegisteredType(HEAP32[(argTypes >> 2) + i2], "parameter " + i2);
      }
      return a;
    }
    function __emval_call(handle, argCount, argTypes, argv) {
      handle = requireHandle(handle);
      var types = __emval_lookupTypes(argCount, argTypes);
      var args = new Array(argCount);
      for (var i2 = 0; i2 < argCount; ++i2) {
        var type = types[i2];
        args[i2] = type["readValueFromPointer"](argv);
        argv += type["argPackAdvance"];
      }
      var rv = handle.apply(void 0, args);
      return __emval_register(rv);
    }
    function __emval_allocateDestructors(destructorsRef) {
      var destructors = [];
      HEAP32[destructorsRef >> 2] = __emval_register(destructors);
      return destructors;
    }
    var emval_symbols = {};
    function getStringOrSymbol(address) {
      var symbol = emval_symbols[address];
      if (symbol === void 0) {
        return readLatin1String(address);
      } else {
        return symbol;
      }
    }
    var emval_methodCallers = [];
    function __emval_call_method(caller, handle, methodName, destructorsRef, args) {
      caller = emval_methodCallers[caller];
      handle = requireHandle(handle);
      methodName = getStringOrSymbol(methodName);
      return caller(handle, methodName, __emval_allocateDestructors(destructorsRef), args);
    }
    function emval_get_global() {
      if (typeof globalThis === "object") {
        return globalThis;
      }
      return function() {
        return Function;
      }()("return this")();
    }
    function __emval_get_global(name) {
      if (name === 0) {
        return __emval_register(emval_get_global());
      } else {
        name = getStringOrSymbol(name);
        return __emval_register(emval_get_global()[name]);
      }
    }
    function __emval_addMethodCaller(caller) {
      var id = emval_methodCallers.length;
      emval_methodCallers.push(caller);
      return id;
    }
    function __emval_get_method_caller(argCount, argTypes) {
      var types = __emval_lookupTypes(argCount, argTypes);
      var retType = types[0];
      var signatureName = retType.name + "_$" + types.slice(1).map(function(t) {
        return t.name;
      }).join("_") + "$";
      var params = ["retType"];
      var args = [retType];
      var argsList = "";
      for (var i2 = 0; i2 < argCount - 1; ++i2) {
        argsList += (i2 !== 0 ? ", " : "") + "arg" + i2;
        params.push("argType" + i2);
        args.push(types[1 + i2]);
      }
      var functionName = makeLegalFunctionName("methodCaller_" + signatureName);
      var functionBody = "return function " + functionName + "(handle, name, destructors, args) {\n";
      var offset = 0;
      for (var i2 = 0; i2 < argCount - 1; ++i2) {
        functionBody += "    var arg" + i2 + " = argType" + i2 + ".readValueFromPointer(args" + (offset ? "+" + offset : "") + ");\n";
        offset += types[i2 + 1]["argPackAdvance"];
      }
      functionBody += "    var rv = handle[name](" + argsList + ");\n";
      for (var i2 = 0; i2 < argCount - 1; ++i2) {
        if (types[i2 + 1]["deleteObject"]) {
          functionBody += "    argType" + i2 + ".deleteObject(arg" + i2 + ");\n";
        }
      }
      if (!retType.isVoid) {
        functionBody += "    return retType.toWireType(destructors, rv);\n";
      }
      functionBody += "};\n";
      params.push(functionBody);
      var invokerFunction = new_(Function, params).apply(null, args);
      return __emval_addMethodCaller(invokerFunction);
    }
    function __emval_get_property(handle, key2) {
      handle = requireHandle(handle);
      key2 = requireHandle(key2);
      return __emval_register(handle[key2]);
    }
    function __emval_incref(handle) {
      if (handle > 4) {
        emval_handle_array[handle].refcount += 1;
      }
    }
    function __emval_new_array() {
      return __emval_register([]);
    }
    function __emval_new_cstring(v) {
      return __emval_register(getStringOrSymbol(v));
    }
    function __emval_new_object() {
      return __emval_register({});
    }
    function __emval_run_destructors(handle) {
      var destructors = emval_handle_array[handle].value;
      runDestructors(destructors);
      __emval_decref(handle);
    }
    function __emval_set_property(handle, key2, value) {
      handle = requireHandle(handle);
      key2 = requireHandle(key2);
      value = requireHandle(value);
      handle[key2] = value;
    }
    function __emval_take_value(type, argv) {
      type = requireRegisteredType(type, "_emval_take_value");
      var v = type["readValueFromPointer"](argv);
      return __emval_register(v);
    }
    function _abort() {
      abort();
    }
    function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
      if (!Browser.mainLoop.func) {
        return 1;
      }
      if (mode == 0) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
          var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
          setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
        };
        Browser.mainLoop.method = "timeout";
      } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = "rAF";
      } else if (mode == 2) {
        if (typeof setImmediate === "undefined") {
          var setImmediates = [];
          var emscriptenMainLoopMessageId = "setimmediate";
          var Browser_setImmediate_messageHandler = function(event2) {
            if (event2.data === emscriptenMainLoopMessageId || event2.data.target === emscriptenMainLoopMessageId) {
              event2.stopPropagation();
              setImmediates.shift()();
            }
          };
          addEventListener("message", Browser_setImmediate_messageHandler, true);
          setImmediate = function Browser_emulated_setImmediate(func) {
            setImmediates.push(func);
            postMessage(emscriptenMainLoopMessageId, "*");
          };
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
          setImmediate(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = "immediate";
      }
      return 0;
    }
    var _emscripten_get_now;
    _emscripten_get_now = function() {
      return performance.now();
    };
    function setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) {
      noExitRuntime = true;
      assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
      Browser.mainLoop.func = browserIterationFunc;
      Browser.mainLoop.arg = arg;
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT)
          return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              next = next + 0.5;
              Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
            }
          }
          console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
          Browser.mainLoop.updateStatus();
          if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
            return;
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
          return;
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
          Browser.mainLoop.scheduler();
          return;
        } else if (Browser.mainLoop.timingMode == 0) {
          Browser.mainLoop.tickStartTime = _emscripten_get_now();
        }
        Browser.mainLoop.runIter(browserIterationFunc);
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
          return;
        if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData)
          SDL.audio.queueNewAudioData();
        Browser.mainLoop.scheduler();
      };
      if (!noSetTiming) {
        if (fps && fps > 0)
          _emscripten_set_main_loop_timing(0, 1e3 / fps);
        else
          _emscripten_set_main_loop_timing(1, 1);
        Browser.mainLoop.scheduler();
      }
      if (simulateInfiniteLoop) {
        throw "unwind";
      }
    }
    var Browser = {mainLoop: {scheduler: null, method: "", currentlyRunningMainloop: 0, func: null, arg: 0, timingMode: 0, timingValue: 0, currentFrameNumber: 0, queue: [], pause: function() {
      Browser.mainLoop.scheduler = null;
      Browser.mainLoop.currentlyRunningMainloop++;
    }, resume: function() {
      Browser.mainLoop.currentlyRunningMainloop++;
      var timingMode = Browser.mainLoop.timingMode;
      var timingValue = Browser.mainLoop.timingValue;
      var func = Browser.mainLoop.func;
      Browser.mainLoop.func = null;
      setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
      _emscripten_set_main_loop_timing(timingMode, timingValue);
      Browser.mainLoop.scheduler();
    }, updateStatus: function() {
      if (Module2["setStatus"]) {
        var message = Module2["statusMessage"] || "Please wait...";
        var remaining = Browser.mainLoop.remainingBlockers;
        var expected = Browser.mainLoop.expectedBlockers;
        if (remaining) {
          if (remaining < expected) {
            Module2["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
          } else {
            Module2["setStatus"](message);
          }
        } else {
          Module2["setStatus"]("");
        }
      }
    }, runIter: function(func) {
      if (ABORT)
        return;
      if (Module2["preMainLoop"]) {
        var preRet = Module2["preMainLoop"]();
        if (preRet === false) {
          return;
        }
      }
      try {
        func();
      } catch (e) {
        if (e instanceof ExitStatus) {
          return;
        } else if (e == "unwind") {
          return;
        } else {
          if (e && typeof e === "object" && e.stack)
            err("exception thrown: " + [e, e.stack]);
          throw e;
        }
      }
      if (Module2["postMainLoop"])
        Module2["postMainLoop"]();
    }}, isFullscreen: false, pointerLock: false, moduleContextCreatedCallbacks: [], workers: [], init: function() {
      if (!Module2["preloadPlugins"])
        Module2["preloadPlugins"] = [];
      if (Browser.initted)
        return;
      Browser.initted = true;
      try {
        new Blob();
        Browser.hasBlobConstructor = true;
      } catch (e) {
        Browser.hasBlobConstructor = false;
        console.log("warning: no blob constructor, cannot create blobs with mimetypes");
      }
      Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
      Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : void 0;
      if (!Module2.noImageDecoding && typeof Browser.URLObject === "undefined") {
        console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
        Module2.noImageDecoding = true;
      }
      var imagePlugin = {};
      imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
        return !Module2.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
      };
      imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
        var b = null;
        if (Browser.hasBlobConstructor) {
          try {
            b = new Blob([byteArray], {type: Browser.getMimetype(name)});
            if (b.size !== byteArray.length) {
              b = new Blob([new Uint8Array(byteArray).buffer], {type: Browser.getMimetype(name)});
            }
          } catch (e) {
            warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
          }
        }
        if (!b) {
          var bb = new Browser.BlobBuilder();
          bb.append(new Uint8Array(byteArray).buffer);
          b = bb.getBlob();
        }
        var url = Browser.URLObject.createObjectURL(b);
        var img = new Image();
        img.onload = function img_onload() {
          assert(img.complete, "Image " + name + " could not be decoded");
          var canvas3 = document.createElement("canvas");
          canvas3.width = img.width;
          canvas3.height = img.height;
          var ctx = canvas3.getContext("2d");
          ctx.drawImage(img, 0, 0);
          Module2["preloadedImages"][name] = canvas3;
          Browser.URLObject.revokeObjectURL(url);
          if (onload)
            onload(byteArray);
        };
        img.onerror = function img_onerror(event2) {
          console.log("Image " + url + " could not be decoded");
          if (onerror)
            onerror();
        };
        img.src = url;
      };
      Module2["preloadPlugins"].push(imagePlugin);
      var audioPlugin = {};
      audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
        return !Module2.noAudioDecoding && name.substr(-4) in {".ogg": 1, ".wav": 1, ".mp3": 1};
      };
      audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
        var done = false;
        function finish(audio2) {
          if (done)
            return;
          done = true;
          Module2["preloadedAudios"][name] = audio2;
          if (onload)
            onload(byteArray);
        }
        function fail() {
          if (done)
            return;
          done = true;
          Module2["preloadedAudios"][name] = new Audio();
          if (onerror)
            onerror();
        }
        if (Browser.hasBlobConstructor) {
          try {
            var b = new Blob([byteArray], {type: Browser.getMimetype(name)});
          } catch (e) {
            return fail();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var audio = new Audio();
          audio.addEventListener("canplaythrough", function() {
            finish(audio);
          }, false);
          audio.onerror = function audio_onerror(event2) {
            if (done)
              return;
            console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
            function encode64(data) {
              var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
              var PAD = "=";
              var ret = "";
              var leftchar = 0;
              var leftbits = 0;
              for (var i2 = 0; i2 < data.length; i2++) {
                leftchar = leftchar << 8 | data[i2];
                leftbits += 8;
                while (leftbits >= 6) {
                  var curr = leftchar >> leftbits - 6 & 63;
                  leftbits -= 6;
                  ret += BASE[curr];
                }
              }
              if (leftbits == 2) {
                ret += BASE[(leftchar & 3) << 4];
                ret += PAD + PAD;
              } else if (leftbits == 4) {
                ret += BASE[(leftchar & 15) << 2];
                ret += PAD;
              }
              return ret;
            }
            audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
            finish(audio);
          };
          audio.src = url;
          Browser.safeSetTimeout(function() {
            finish(audio);
          }, 1e4);
        } else {
          return fail();
        }
      };
      Module2["preloadPlugins"].push(audioPlugin);
      function pointerLockChange() {
        Browser.pointerLock = document["pointerLockElement"] === Module2["canvas"] || document["mozPointerLockElement"] === Module2["canvas"] || document["webkitPointerLockElement"] === Module2["canvas"] || document["msPointerLockElement"] === Module2["canvas"];
      }
      var canvas2 = Module2["canvas"];
      if (canvas2) {
        canvas2.requestPointerLock = canvas2["requestPointerLock"] || canvas2["mozRequestPointerLock"] || canvas2["webkitRequestPointerLock"] || canvas2["msRequestPointerLock"] || function() {
        };
        canvas2.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || function() {
        };
        canvas2.exitPointerLock = canvas2.exitPointerLock.bind(document);
        document.addEventListener("pointerlockchange", pointerLockChange, false);
        document.addEventListener("mozpointerlockchange", pointerLockChange, false);
        document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
        document.addEventListener("mspointerlockchange", pointerLockChange, false);
        if (Module2["elementPointerLock"]) {
          canvas2.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && Module2["canvas"].requestPointerLock) {
              Module2["canvas"].requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      }
    }, createContext: function(canvas2, useWebGL, setInModule, webGLContextAttributes) {
      if (useWebGL && Module2.ctx && canvas2 == Module2.canvas)
        return Module2.ctx;
      var ctx;
      var contextHandle;
      if (useWebGL) {
        var contextAttributes = {antialias: false, alpha: false, majorVersion: 1};
        if (webGLContextAttributes) {
          for (var attribute in webGLContextAttributes) {
            contextAttributes[attribute] = webGLContextAttributes[attribute];
          }
        }
        if (typeof GL !== "undefined") {
          contextHandle = GL.createContext(canvas2, contextAttributes);
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx;
          }
        }
      } else {
        ctx = canvas2.getContext("2d");
      }
      if (!ctx)
        return null;
      if (setInModule) {
        if (!useWebGL)
          assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
        Module2.ctx = ctx;
        if (useWebGL)
          GL.makeContextCurrent(contextHandle);
        Module2.useWebGL = useWebGL;
        Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
          callback();
        });
        Browser.init();
      }
      return ctx;
    }, destroyContext: function(canvas2, useWebGL, setInModule) {
    }, fullscreenHandlersInstalled: false, lockPointer: void 0, resizeCanvas: void 0, requestFullscreen: function(lockPointer, resizeCanvas) {
      Browser.lockPointer = lockPointer;
      Browser.resizeCanvas = resizeCanvas;
      if (typeof Browser.lockPointer === "undefined")
        Browser.lockPointer = true;
      if (typeof Browser.resizeCanvas === "undefined")
        Browser.resizeCanvas = false;
      var canvas2 = Module2["canvas"];
      function fullscreenChange() {
        Browser.isFullscreen = false;
        var canvasContainer2 = canvas2.parentNode;
        if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer2) {
          canvas2.exitFullscreen = Browser.exitFullscreen;
          if (Browser.lockPointer)
            canvas2.requestPointerLock();
          Browser.isFullscreen = true;
          if (Browser.resizeCanvas) {
            Browser.setFullscreenCanvasSize();
          } else {
            Browser.updateCanvasDimensions(canvas2);
          }
        } else {
          canvasContainer2.parentNode.insertBefore(canvas2, canvasContainer2);
          canvasContainer2.parentNode.removeChild(canvasContainer2);
          if (Browser.resizeCanvas) {
            Browser.setWindowedCanvasSize();
          } else {
            Browser.updateCanvasDimensions(canvas2);
          }
        }
        if (Module2["onFullScreen"])
          Module2["onFullScreen"](Browser.isFullscreen);
        if (Module2["onFullscreen"])
          Module2["onFullscreen"](Browser.isFullscreen);
      }
      if (!Browser.fullscreenHandlersInstalled) {
        Browser.fullscreenHandlersInstalled = true;
        document.addEventListener("fullscreenchange", fullscreenChange, false);
        document.addEventListener("mozfullscreenchange", fullscreenChange, false);
        document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
        document.addEventListener("MSFullscreenChange", fullscreenChange, false);
      }
      var canvasContainer = document.createElement("div");
      canvas2.parentNode.insertBefore(canvasContainer, canvas2);
      canvasContainer.appendChild(canvas2);
      canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? function() {
        canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
      } : null) || (canvasContainer["webkitRequestFullScreen"] ? function() {
        canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
      } : null);
      canvasContainer.requestFullscreen();
    }, exitFullscreen: function() {
      if (!Browser.isFullscreen) {
        return false;
      }
      var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || function() {
      };
      CFS.apply(document, []);
      return true;
    }, nextRAF: 0, fakeRequestAnimationFrame: function(func) {
      var now = Date.now();
      if (Browser.nextRAF === 0) {
        Browser.nextRAF = now + 1e3 / 60;
      } else {
        while (now + 2 >= Browser.nextRAF) {
          Browser.nextRAF += 1e3 / 60;
        }
      }
      var delay = Math.max(Browser.nextRAF - now, 0);
      setTimeout(func, delay);
    }, requestAnimationFrame: function(func) {
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(func);
        return;
      }
      var RAF = Browser.fakeRequestAnimationFrame;
      RAF(func);
    }, safeRequestAnimationFrame: function(func) {
      return Browser.requestAnimationFrame(function() {
        if (ABORT)
          return;
        func();
      });
    }, safeSetTimeout: function(func, timeout) {
      noExitRuntime = true;
      return setTimeout(function() {
        if (ABORT)
          return;
        func();
      }, timeout);
    }, getMimetype: function(name) {
      return {jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", bmp: "image/bmp", ogg: "audio/ogg", wav: "audio/wav", mp3: "audio/mpeg"}[name.substr(name.lastIndexOf(".") + 1)];
    }, getUserMedia: function(func) {
      if (!window.getUserMedia) {
        window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
      }
      window.getUserMedia(func);
    }, getMovementX: function(event2) {
      return event2["movementX"] || event2["mozMovementX"] || event2["webkitMovementX"] || 0;
    }, getMovementY: function(event2) {
      return event2["movementY"] || event2["mozMovementY"] || event2["webkitMovementY"] || 0;
    }, getMouseWheelDelta: function(event2) {
      var delta = 0;
      switch (event2.type) {
        case "DOMMouseScroll":
          delta = event2.detail / 3;
          break;
        case "mousewheel":
          delta = event2.wheelDelta / 120;
          break;
        case "wheel":
          delta = event2.deltaY;
          switch (event2.deltaMode) {
            case 0:
              delta /= 100;
              break;
            case 1:
              delta /= 3;
              break;
            case 2:
              delta *= 80;
              break;
            default:
              throw "unrecognized mouse wheel delta mode: " + event2.deltaMode;
          }
          break;
        default:
          throw "unrecognized mouse wheel event: " + event2.type;
      }
      return delta;
    }, mouseX: 0, mouseY: 0, mouseMovementX: 0, mouseMovementY: 0, touches: {}, lastTouches: {}, calculateMouseEvent: function(event2) {
      if (Browser.pointerLock) {
        if (event2.type != "mousemove" && "mozMovementX" in event2) {
          Browser.mouseMovementX = Browser.mouseMovementY = 0;
        } else {
          Browser.mouseMovementX = Browser.getMovementX(event2);
          Browser.mouseMovementY = Browser.getMovementY(event2);
        }
        if (typeof SDL != "undefined") {
          Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
        } else {
          Browser.mouseX += Browser.mouseMovementX;
          Browser.mouseY += Browser.mouseMovementY;
        }
      } else {
        var rect = Module2["canvas"].getBoundingClientRect();
        var cw = Module2["canvas"].width;
        var ch = Module2["canvas"].height;
        var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
        var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
        if (event2.type === "touchstart" || event2.type === "touchend" || event2.type === "touchmove") {
          var touch = event2.touch;
          if (touch === void 0) {
            return;
          }
          var adjustedX = touch.pageX - (scrollX + rect.left);
          var adjustedY = touch.pageY - (scrollY + rect.top);
          adjustedX = adjustedX * (cw / rect.width);
          adjustedY = adjustedY * (ch / rect.height);
          var coords = {x: adjustedX, y: adjustedY};
          if (event2.type === "touchstart") {
            Browser.lastTouches[touch.identifier] = coords;
            Browser.touches[touch.identifier] = coords;
          } else if (event2.type === "touchend" || event2.type === "touchmove") {
            var last = Browser.touches[touch.identifier];
            if (!last)
              last = coords;
            Browser.lastTouches[touch.identifier] = last;
            Browser.touches[touch.identifier] = coords;
          }
          return;
        }
        var x = event2.pageX - (scrollX + rect.left);
        var y = event2.pageY - (scrollY + rect.top);
        x = x * (cw / rect.width);
        y = y * (ch / rect.height);
        Browser.mouseMovementX = x - Browser.mouseX;
        Browser.mouseMovementY = y - Browser.mouseY;
        Browser.mouseX = x;
        Browser.mouseY = y;
      }
    }, asyncLoad: function(url, onload, onerror, noRunDep) {
      var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
      readAsync(url, function(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
        onload(new Uint8Array(arrayBuffer));
        if (dep)
          removeRunDependency();
      }, function(event2) {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      });
      if (dep)
        addRunDependency();
    }, resizeListeners: [], updateResizeListeners: function() {
      var canvas2 = Module2["canvas"];
      Browser.resizeListeners.forEach(function(listener) {
        listener(canvas2.width, canvas2.height);
      });
    }, setCanvasSize: function(width, height, noUpdates) {
      var canvas2 = Module2["canvas"];
      Browser.updateCanvasDimensions(canvas2, width, height);
      if (!noUpdates)
        Browser.updateResizeListeners();
    }, windowedWidth: 0, windowedHeight: 0, setFullscreenCanvasSize: function() {
      if (typeof SDL != "undefined") {
        var flags = HEAPU32[SDL.screen >> 2];
        flags = flags | 8388608;
        HEAP32[SDL.screen >> 2] = flags;
      }
      Browser.updateCanvasDimensions(Module2["canvas"]);
      Browser.updateResizeListeners();
    }, setWindowedCanvasSize: function() {
      if (typeof SDL != "undefined") {
        var flags = HEAPU32[SDL.screen >> 2];
        flags = flags & ~8388608;
        HEAP32[SDL.screen >> 2] = flags;
      }
      Browser.updateCanvasDimensions(Module2["canvas"]);
      Browser.updateResizeListeners();
    }, updateCanvasDimensions: function(canvas2, wNative, hNative) {
      if (wNative && hNative) {
        canvas2.widthNative = wNative;
        canvas2.heightNative = hNative;
      } else {
        wNative = canvas2.widthNative;
        hNative = canvas2.heightNative;
      }
      var w = wNative;
      var h = hNative;
      if (Module2["forcedAspectRatio"] && Module2["forcedAspectRatio"] > 0) {
        if (w / h < Module2["forcedAspectRatio"]) {
          w = Math.round(h * Module2["forcedAspectRatio"]);
        } else {
          h = Math.round(w / Module2["forcedAspectRatio"]);
        }
      }
      if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas2.parentNode && typeof screen != "undefined") {
        var factor = Math.min(screen.width / w, screen.height / h);
        w = Math.round(w * factor);
        h = Math.round(h * factor);
      }
      if (Browser.resizeCanvas) {
        if (canvas2.width != w)
          canvas2.width = w;
        if (canvas2.height != h)
          canvas2.height = h;
        if (typeof canvas2.style != "undefined") {
          canvas2.style.removeProperty("width");
          canvas2.style.removeProperty("height");
        }
      } else {
        if (canvas2.width != wNative)
          canvas2.width = wNative;
        if (canvas2.height != hNative)
          canvas2.height = hNative;
        if (typeof canvas2.style != "undefined") {
          if (w != wNative || h != hNative) {
            canvas2.style.setProperty("width", w + "px", "important");
            canvas2.style.setProperty("height", h + "px", "important");
          } else {
            canvas2.style.removeProperty("width");
            canvas2.style.removeProperty("height");
          }
        }
      }
    }, wgetRequests: {}, nextWgetRequestHandle: 0, getNextWgetRequestHandle: function() {
      var handle = Browser.nextWgetRequestHandle;
      Browser.nextWgetRequestHandle++;
      return handle;
    }};
    var AL = {QUEUE_INTERVAL: 25, QUEUE_LOOKAHEAD: 0.1, DEVICE_NAME: "Emscripten OpenAL", CAPTURE_DEVICE_NAME: "Emscripten OpenAL capture", ALC_EXTENSIONS: {ALC_SOFT_pause_device: true, ALC_SOFT_HRTF: true}, AL_EXTENSIONS: {AL_EXT_float32: true, AL_SOFT_loop_points: true, AL_SOFT_source_length: true, AL_EXT_source_distance_model: true, AL_SOFT_source_spatialize: true}, _alcErr: 0, alcErr: 0, deviceRefCounts: {}, alcStringCache: {}, paused: false, stringCache: {}, contexts: {}, currentCtx: null, buffers: {0: {id: 0, refCount: 0, audioBuf: null, frequency: 0, bytesPerSample: 2, channels: 1, length: 0}}, paramArray: [], _nextId: 1, newId: function() {
      return AL.freeIds.length > 0 ? AL.freeIds.pop() : AL._nextId++;
    }, freeIds: [], scheduleContextAudio: function(ctx) {
      if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
        return;
      }
      for (var i2 in ctx.sources) {
        AL.scheduleSourceAudio(ctx.sources[i2]);
      }
    }, scheduleSourceAudio: function(src, lookahead) {
      if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
        return;
      }
      if (src.state !== 4114) {
        return;
      }
      var currentTime = AL.updateSourceTime(src);
      var startTime = src.bufStartTime;
      var startOffset = src.bufOffset;
      var bufCursor = src.bufsProcessed;
      for (var i2 = 0; i2 < src.audioQueue.length; i2++) {
        var audioSrc = src.audioQueue[i2];
        startTime = audioSrc._startTime + audioSrc._duration;
        startOffset = 0;
        bufCursor += audioSrc._skipCount + 1;
      }
      if (!lookahead) {
        lookahead = AL.QUEUE_LOOKAHEAD;
      }
      var lookaheadTime = currentTime + lookahead;
      var skipCount = 0;
      while (startTime < lookaheadTime) {
        if (bufCursor >= src.bufQueue.length) {
          if (src.looping) {
            bufCursor %= src.bufQueue.length;
          } else {
            break;
          }
        }
        var buf = src.bufQueue[bufCursor % src.bufQueue.length];
        if (buf.length === 0) {
          skipCount++;
          if (skipCount === src.bufQueue.length) {
            break;
          }
        } else {
          var audioSrc = src.context.audioCtx.createBufferSource();
          audioSrc.buffer = buf.audioBuf;
          audioSrc.playbackRate.value = src.playbackRate;
          if (buf.audioBuf._loopStart || buf.audioBuf._loopEnd) {
            audioSrc.loopStart = buf.audioBuf._loopStart;
            audioSrc.loopEnd = buf.audioBuf._loopEnd;
          }
          var duration = 0;
          if (src.type === 4136 && src.looping) {
            duration = Number.POSITIVE_INFINITY;
            audioSrc.loop = true;
            if (buf.audioBuf._loopStart) {
              audioSrc.loopStart = buf.audioBuf._loopStart;
            }
            if (buf.audioBuf._loopEnd) {
              audioSrc.loopEnd = buf.audioBuf._loopEnd;
            }
          } else {
            duration = (buf.audioBuf.duration - startOffset) / src.playbackRate;
          }
          audioSrc._startOffset = startOffset;
          audioSrc._duration = duration;
          audioSrc._skipCount = skipCount;
          skipCount = 0;
          audioSrc.connect(src.gain);
          if (typeof audioSrc.start !== "undefined") {
            startTime = Math.max(startTime, src.context.audioCtx.currentTime);
            audioSrc.start(startTime, startOffset);
          } else if (typeof audioSrc.noteOn !== "undefined") {
            startTime = Math.max(startTime, src.context.audioCtx.currentTime);
            audioSrc.noteOn(startTime);
          }
          audioSrc._startTime = startTime;
          src.audioQueue.push(audioSrc);
          startTime += duration;
        }
        startOffset = 0;
        bufCursor++;
      }
    }, updateSourceTime: function(src) {
      var currentTime = src.context.audioCtx.currentTime;
      if (src.state !== 4114) {
        return currentTime;
      }
      if (!isFinite(src.bufStartTime)) {
        src.bufStartTime = currentTime - src.bufOffset / src.playbackRate;
        src.bufOffset = 0;
      }
      var nextStartTime = 0;
      while (src.audioQueue.length) {
        var audioSrc = src.audioQueue[0];
        src.bufsProcessed += audioSrc._skipCount;
        nextStartTime = audioSrc._startTime + audioSrc._duration;
        if (currentTime < nextStartTime) {
          break;
        }
        src.audioQueue.shift();
        src.bufStartTime = nextStartTime;
        src.bufOffset = 0;
        src.bufsProcessed++;
      }
      if (src.bufsProcessed >= src.bufQueue.length && !src.looping) {
        AL.setSourceState(src, 4116);
      } else if (src.type === 4136 && src.looping) {
        var buf = src.bufQueue[0];
        if (buf.length === 0) {
          src.bufOffset = 0;
        } else {
          var delta = (currentTime - src.bufStartTime) * src.playbackRate;
          var loopStart = buf.audioBuf._loopStart || 0;
          var loopEnd = buf.audioBuf._loopEnd || buf.audioBuf.duration;
          if (loopEnd <= loopStart) {
            loopEnd = buf.audioBuf.duration;
          }
          if (delta < loopEnd) {
            src.bufOffset = delta;
          } else {
            src.bufOffset = loopStart + (delta - loopStart) % (loopEnd - loopStart);
          }
        }
      } else if (src.audioQueue[0]) {
        src.bufOffset = (currentTime - src.audioQueue[0]._startTime) * src.playbackRate;
      } else {
        if (src.type !== 4136 && src.looping) {
          var srcDuration = AL.sourceDuration(src) / src.playbackRate;
          if (srcDuration > 0) {
            src.bufStartTime += Math.floor((currentTime - src.bufStartTime) / srcDuration) * srcDuration;
          }
        }
        for (var i2 = 0; i2 < src.bufQueue.length; i2++) {
          if (src.bufsProcessed >= src.bufQueue.length) {
            if (src.looping) {
              src.bufsProcessed %= src.bufQueue.length;
            } else {
              AL.setSourceState(src, 4116);
              break;
            }
          }
          var buf = src.bufQueue[src.bufsProcessed];
          if (buf.length > 0) {
            nextStartTime = src.bufStartTime + buf.audioBuf.duration / src.playbackRate;
            if (currentTime < nextStartTime) {
              src.bufOffset = (currentTime - src.bufStartTime) * src.playbackRate;
              break;
            }
            src.bufStartTime = nextStartTime;
          }
          src.bufOffset = 0;
          src.bufsProcessed++;
        }
      }
      return currentTime;
    }, cancelPendingSourceAudio: function(src) {
      AL.updateSourceTime(src);
      for (var i2 = 1; i2 < src.audioQueue.length; i2++) {
        var audioSrc = src.audioQueue[i2];
        audioSrc.stop();
      }
      if (src.audioQueue.length > 1) {
        src.audioQueue.length = 1;
      }
    }, stopSourceAudio: function(src) {
      for (var i2 = 0; i2 < src.audioQueue.length; i2++) {
        src.audioQueue[i2].stop();
      }
      src.audioQueue.length = 0;
    }, setSourceState: function(src, state) {
      if (state === 4114) {
        if (src.state === 4114 || src.state == 4116) {
          src.bufsProcessed = 0;
          src.bufOffset = 0;
        }
        AL.stopSourceAudio(src);
        src.state = 4114;
        src.bufStartTime = Number.NEGATIVE_INFINITY;
        AL.scheduleSourceAudio(src);
      } else if (state === 4115) {
        if (src.state === 4114) {
          AL.updateSourceTime(src);
          AL.stopSourceAudio(src);
          src.state = 4115;
        }
      } else if (state === 4116) {
        if (src.state !== 4113) {
          src.state = 4116;
          src.bufsProcessed = src.bufQueue.length;
          src.bufStartTime = Number.NEGATIVE_INFINITY;
          src.bufOffset = 0;
          AL.stopSourceAudio(src);
        }
      } else if (state === 4113) {
        if (src.state !== 4113) {
          src.state = 4113;
          src.bufsProcessed = 0;
          src.bufStartTime = Number.NEGATIVE_INFINITY;
          src.bufOffset = 0;
          AL.stopSourceAudio(src);
        }
      }
    }, initSourcePanner: function(src) {
      if (src.type === 4144) {
        return;
      }
      var templateBuf = AL.buffers[0];
      for (var i2 = 0; i2 < src.bufQueue.length; i2++) {
        if (src.bufQueue[i2].id !== 0) {
          templateBuf = src.bufQueue[i2];
          break;
        }
      }
      if (src.spatialize === 1 || src.spatialize === 2 && templateBuf.channels === 1) {
        if (src.panner) {
          return;
        }
        src.panner = src.context.audioCtx.createPanner();
        AL.updateSourceGlobal(src);
        AL.updateSourceSpace(src);
        src.panner.connect(src.context.gain);
        src.gain.disconnect();
        src.gain.connect(src.panner);
      } else {
        if (!src.panner) {
          return;
        }
        src.panner.disconnect();
        src.gain.disconnect();
        src.gain.connect(src.context.gain);
        src.panner = null;
      }
    }, updateContextGlobal: function(ctx) {
      for (var i2 in ctx.sources) {
        AL.updateSourceGlobal(ctx.sources[i2]);
      }
    }, updateSourceGlobal: function(src) {
      var panner = src.panner;
      if (!panner) {
        return;
      }
      panner.refDistance = src.refDistance;
      panner.maxDistance = src.maxDistance;
      panner.rolloffFactor = src.rolloffFactor;
      panner.panningModel = src.context.hrtf ? "HRTF" : "equalpower";
      var distanceModel = src.context.sourceDistanceModel ? src.distanceModel : src.context.distanceModel;
      switch (distanceModel) {
        case 0:
          panner.distanceModel = "inverse";
          panner.refDistance = 340282e33;
          break;
        case 53249:
        case 53250:
          panner.distanceModel = "inverse";
          break;
        case 53251:
        case 53252:
          panner.distanceModel = "linear";
          break;
        case 53253:
        case 53254:
          panner.distanceModel = "exponential";
          break;
      }
    }, updateListenerSpace: function(ctx) {
      var listener = ctx.audioCtx.listener;
      if (listener.positionX) {
        listener.positionX.value = ctx.listener.position[0];
        listener.positionY.value = ctx.listener.position[1];
        listener.positionZ.value = ctx.listener.position[2];
      } else {
        listener.setPosition(ctx.listener.position[0], ctx.listener.position[1], ctx.listener.position[2]);
      }
      if (listener.forwardX) {
        listener.forwardX.value = ctx.listener.direction[0];
        listener.forwardY.value = ctx.listener.direction[1];
        listener.forwardZ.value = ctx.listener.direction[2];
        listener.upX.value = ctx.listener.up[0];
        listener.upY.value = ctx.listener.up[1];
        listener.upZ.value = ctx.listener.up[2];
      } else {
        listener.setOrientation(ctx.listener.direction[0], ctx.listener.direction[1], ctx.listener.direction[2], ctx.listener.up[0], ctx.listener.up[1], ctx.listener.up[2]);
      }
      for (var i2 in ctx.sources) {
        AL.updateSourceSpace(ctx.sources[i2]);
      }
    }, updateSourceSpace: function(src) {
      if (!src.panner) {
        return;
      }
      var panner = src.panner;
      var posX = src.position[0];
      var posY = src.position[1];
      var posZ = src.position[2];
      var dirX = src.direction[0];
      var dirY = src.direction[1];
      var dirZ = src.direction[2];
      var listener = src.context.listener;
      var lPosX = listener.position[0];
      var lPosY = listener.position[1];
      var lPosZ = listener.position[2];
      if (src.relative) {
        var lBackX = -listener.direction[0];
        var lBackY = -listener.direction[1];
        var lBackZ = -listener.direction[2];
        var lUpX = listener.up[0];
        var lUpY = listener.up[1];
        var lUpZ = listener.up[2];
        var inverseMagnitude = function(x, y, z) {
          var length = Math.sqrt(x * x + y * y + z * z);
          if (length < Number.EPSILON) {
            return 0;
          }
          return 1 / length;
        };
        var invMag = inverseMagnitude(lBackX, lBackY, lBackZ);
        lBackX *= invMag;
        lBackY *= invMag;
        lBackZ *= invMag;
        invMag = inverseMagnitude(lUpX, lUpY, lUpZ);
        lUpX *= invMag;
        lUpY *= invMag;
        lUpZ *= invMag;
        var lRightX = lUpY * lBackZ - lUpZ * lBackY;
        var lRightY = lUpZ * lBackX - lUpX * lBackZ;
        var lRightZ = lUpX * lBackY - lUpY * lBackX;
        invMag = inverseMagnitude(lRightX, lRightY, lRightZ);
        lRightX *= invMag;
        lRightY *= invMag;
        lRightZ *= invMag;
        lUpX = lBackY * lRightZ - lBackZ * lRightY;
        lUpY = lBackZ * lRightX - lBackX * lRightZ;
        lUpZ = lBackX * lRightY - lBackY * lRightX;
        var oldX = dirX;
        var oldY = dirY;
        var oldZ = dirZ;
        dirX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
        dirY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
        dirZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
        oldX = posX;
        oldY = posY;
        oldZ = posZ;
        posX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
        posY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
        posZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
        posX += lPosX;
        posY += lPosY;
        posZ += lPosZ;
      }
      if (panner.positionX) {
        panner.positionX.value = posX;
        panner.positionY.value = posY;
        panner.positionZ.value = posZ;
      } else {
        panner.setPosition(posX, posY, posZ);
      }
      if (panner.orientationX) {
        panner.orientationX.value = dirX;
        panner.orientationY.value = dirY;
        panner.orientationZ.value = dirZ;
      } else {
        panner.setOrientation(dirX, dirY, dirZ);
      }
      var oldShift = src.dopplerShift;
      var velX = src.velocity[0];
      var velY = src.velocity[1];
      var velZ = src.velocity[2];
      var lVelX = listener.velocity[0];
      var lVelY = listener.velocity[1];
      var lVelZ = listener.velocity[2];
      if (posX === lPosX && posY === lPosY && posZ === lPosZ || velX === lVelX && velY === lVelY && velZ === lVelZ) {
        src.dopplerShift = 1;
      } else {
        var speedOfSound = src.context.speedOfSound;
        var dopplerFactor = src.context.dopplerFactor;
        var slX = lPosX - posX;
        var slY = lPosY - posY;
        var slZ = lPosZ - posZ;
        var magSl = Math.sqrt(slX * slX + slY * slY + slZ * slZ);
        var vls = (slX * lVelX + slY * lVelY + slZ * lVelZ) / magSl;
        var vss = (slX * velX + slY * velY + slZ * velZ) / magSl;
        vls = Math.min(vls, speedOfSound / dopplerFactor);
        vss = Math.min(vss, speedOfSound / dopplerFactor);
        src.dopplerShift = (speedOfSound - dopplerFactor * vls) / (speedOfSound - dopplerFactor * vss);
      }
      if (src.dopplerShift !== oldShift) {
        AL.updateSourceRate(src);
      }
    }, updateSourceRate: function(src) {
      if (src.state === 4114) {
        AL.cancelPendingSourceAudio(src);
        var audioSrc = src.audioQueue[0];
        if (!audioSrc) {
          return;
        }
        var duration;
        if (src.type === 4136 && src.looping) {
          duration = Number.POSITIVE_INFINITY;
        } else {
          duration = (audioSrc.buffer.duration - audioSrc._startOffset) / src.playbackRate;
        }
        audioSrc._duration = duration;
        audioSrc.playbackRate.value = src.playbackRate;
        AL.scheduleSourceAudio(src);
      }
    }, sourceDuration: function(src) {
      var length = 0;
      for (var i2 = 0; i2 < src.bufQueue.length; i2++) {
        var audioBuf = src.bufQueue[i2].audioBuf;
        length += audioBuf ? audioBuf.duration : 0;
      }
      return length;
    }, sourceTell: function(src) {
      AL.updateSourceTime(src);
      var offset = 0;
      for (var i2 = 0; i2 < src.bufsProcessed; i2++) {
        offset += src.bufQueue[i2].audioBuf.duration;
      }
      offset += src.bufOffset;
      return offset;
    }, sourceSeek: function(src, offset) {
      var playing = src.state == 4114;
      if (playing) {
        AL.setSourceState(src, 4113);
      }
      if (src.bufQueue[src.bufsProcessed].audioBuf !== null) {
        src.bufsProcessed = 0;
        while (offset > src.bufQueue[src.bufsProcessed].audioBuf.duration) {
          offset -= src.bufQueue[src.bufsProcessed].audiobuf.duration;
          src.bufsProcessed++;
        }
        src.bufOffset = offset;
      }
      if (playing) {
        AL.setSourceState(src, 4114);
      }
    }, getGlobalParam: function(funcname, param) {
      if (!AL.currentCtx) {
        return null;
      }
      switch (param) {
        case 49152:
          return AL.currentCtx.dopplerFactor;
        case 49155:
          return AL.currentCtx.speedOfSound;
        case 53248:
          return AL.currentCtx.distanceModel;
        default:
          AL.currentCtx.err = 40962;
          return null;
      }
    }, setGlobalParam: function(funcname, param, value) {
      if (!AL.currentCtx) {
        return;
      }
      switch (param) {
        case 49152:
          if (!Number.isFinite(value) || value < 0) {
            AL.currentCtx.err = 40963;
            return;
          }
          AL.currentCtx.dopplerFactor = value;
          AL.updateListenerSpace(AL.currentCtx);
          break;
        case 49155:
          if (!Number.isFinite(value) || value <= 0) {
            AL.currentCtx.err = 40963;
            return;
          }
          AL.currentCtx.speedOfSound = value;
          AL.updateListenerSpace(AL.currentCtx);
          break;
        case 53248:
          switch (value) {
            case 0:
            case 53249:
            case 53250:
            case 53251:
            case 53252:
            case 53253:
            case 53254:
              AL.currentCtx.distanceModel = value;
              AL.updateContextGlobal(AL.currentCtx);
              break;
            default:
              AL.currentCtx.err = 40963;
              return;
          }
          break;
        default:
          AL.currentCtx.err = 40962;
          return;
      }
    }, getListenerParam: function(funcname, param) {
      if (!AL.currentCtx) {
        return null;
      }
      switch (param) {
        case 4100:
          return AL.currentCtx.listener.position;
        case 4102:
          return AL.currentCtx.listener.velocity;
        case 4111:
          return AL.currentCtx.listener.direction.concat(AL.currentCtx.listener.up);
        case 4106:
          return AL.currentCtx.gain.gain.value;
        default:
          AL.currentCtx.err = 40962;
          return null;
      }
    }, setListenerParam: function(funcname, param, value) {
      if (!AL.currentCtx) {
        return;
      }
      if (value === null) {
        AL.currentCtx.err = 40962;
        return;
      }
      var listener = AL.currentCtx.listener;
      switch (param) {
        case 4100:
          if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
            AL.currentCtx.err = 40963;
            return;
          }
          listener.position[0] = value[0];
          listener.position[1] = value[1];
          listener.position[2] = value[2];
          AL.updateListenerSpace(AL.currentCtx);
          break;
        case 4102:
          if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
            AL.currentCtx.err = 40963;
            return;
          }
          listener.velocity[0] = value[0];
          listener.velocity[1] = value[1];
          listener.velocity[2] = value[2];
          AL.updateListenerSpace(AL.currentCtx);
          break;
        case 4106:
          if (!Number.isFinite(value) || value < 0) {
            AL.currentCtx.err = 40963;
            return;
          }
          AL.currentCtx.gain.gain.value = value;
          break;
        case 4111:
          if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2]) || !Number.isFinite(value[3]) || !Number.isFinite(value[4]) || !Number.isFinite(value[5])) {
            AL.currentCtx.err = 40963;
            return;
          }
          listener.direction[0] = value[0];
          listener.direction[1] = value[1];
          listener.direction[2] = value[2];
          listener.up[0] = value[3];
          listener.up[1] = value[4];
          listener.up[2] = value[5];
          AL.updateListenerSpace(AL.currentCtx);
          break;
        default:
          AL.currentCtx.err = 40962;
          return;
      }
    }, getBufferParam: function(funcname, bufferId, param) {
      if (!AL.currentCtx) {
        return;
      }
      var buf = AL.buffers[bufferId];
      if (!buf || bufferId === 0) {
        AL.currentCtx.err = 40961;
        return;
      }
      switch (param) {
        case 8193:
          return buf.frequency;
        case 8194:
          return buf.bytesPerSample * 8;
        case 8195:
          return buf.channels;
        case 8196:
          return buf.length * buf.bytesPerSample * buf.channels;
        case 8213:
          if (buf.length === 0) {
            return [0, 0];
          } else {
            return [(buf.audioBuf._loopStart || 0) * buf.frequency, (buf.audioBuf._loopEnd || buf.length) * buf.frequency];
          }
        default:
          AL.currentCtx.err = 40962;
          return null;
      }
    }, setBufferParam: function(funcname, bufferId, param, value) {
      if (!AL.currentCtx) {
        return;
      }
      var buf = AL.buffers[bufferId];
      if (!buf || bufferId === 0) {
        AL.currentCtx.err = 40961;
        return;
      }
      if (value === null) {
        AL.currentCtx.err = 40962;
        return;
      }
      switch (param) {
        case 8196:
          if (value !== 0) {
            AL.currentCtx.err = 40963;
            return;
          }
          break;
        case 8213:
          if (value[0] < 0 || value[0] > buf.length || value[1] < 0 || value[1] > buf.Length || value[0] >= value[1]) {
            AL.currentCtx.err = 40963;
            return;
          }
          if (buf.refCount > 0) {
            AL.currentCtx.err = 40964;
            return;
          }
          if (buf.audioBuf) {
            buf.audioBuf._loopStart = value[0] / buf.frequency;
            buf.audioBuf._loopEnd = value[1] / buf.frequency;
          }
          break;
        default:
          AL.currentCtx.err = 40962;
          return;
      }
    }, getSourceParam: function(funcname, sourceId, param) {
      if (!AL.currentCtx) {
        return null;
      }
      var src = AL.currentCtx.sources[sourceId];
      if (!src) {
        AL.currentCtx.err = 40961;
        return null;
      }
      switch (param) {
        case 514:
          return src.relative;
        case 4097:
          return src.coneInnerAngle;
        case 4098:
          return src.coneOuterAngle;
        case 4099:
          return src.pitch;
        case 4100:
          return src.position;
        case 4101:
          return src.direction;
        case 4102:
          return src.velocity;
        case 4103:
          return src.looping;
        case 4105:
          if (src.type === 4136) {
            return src.bufQueue[0].id;
          } else {
            return 0;
          }
        case 4106:
          return src.gain.gain.value;
        case 4109:
          return src.minGain;
        case 4110:
          return src.maxGain;
        case 4112:
          return src.state;
        case 4117:
          if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
            return 0;
          } else {
            return src.bufQueue.length;
          }
        case 4118:
          if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 || src.looping) {
            return 0;
          } else {
            return src.bufsProcessed;
          }
        case 4128:
          return src.refDistance;
        case 4129:
          return src.rolloffFactor;
        case 4130:
          return src.coneOuterGain;
        case 4131:
          return src.maxDistance;
        case 4132:
          return AL.sourceTell(src);
        case 4133:
          var offset = AL.sourceTell(src);
          if (offset > 0) {
            offset *= src.bufQueue[0].frequency;
          }
          return offset;
        case 4134:
          var offset = AL.sourceTell(src);
          if (offset > 0) {
            offset *= src.bufQueue[0].frequency * src.bufQueue[0].bytesPerSample;
          }
          return offset;
        case 4135:
          return src.type;
        case 4628:
          return src.spatialize;
        case 8201:
          var length = 0;
          var bytesPerFrame = 0;
          for (var i2 = 0; i2 < src.bufQueue.length; i2++) {
            length += src.bufQueue[i2].length;
            if (src.bufQueue[i2].id !== 0) {
              bytesPerFrame = src.bufQueue[i2].bytesPerSample * src.bufQueue[i2].channels;
            }
          }
          return length * bytesPerFrame;
        case 8202:
          var length = 0;
          for (var i2 = 0; i2 < src.bufQueue.length; i2++) {
            length += src.bufQueue[i2].length;
          }
          return length;
        case 8203:
          return AL.sourceDuration(src);
        case 53248:
          return src.distanceModel;
        default:
          AL.currentCtx.err = 40962;
          return null;
      }
    }, setSourceParam: function(funcname, sourceId, param, value) {
      if (!AL.currentCtx) {
        return;
      }
      var src = AL.currentCtx.sources[sourceId];
      if (!src) {
        AL.currentCtx.err = 40961;
        return;
      }
      if (value === null) {
        AL.currentCtx.err = 40962;
        return;
      }
      switch (param) {
        case 514:
          if (value === 1) {
            src.relative = true;
            AL.updateSourceSpace(src);
          } else if (value === 0) {
            src.relative = false;
            AL.updateSourceSpace(src);
          } else {
            AL.currentCtx.err = 40963;
            return;
          }
          break;
        case 4097:
          if (!Number.isFinite(value)) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.coneInnerAngle = value;
          if (src.panner) {
            src.panner.coneInnerAngle = value % 360;
          }
          break;
        case 4098:
          if (!Number.isFinite(value)) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.coneOuterAngle = value;
          if (src.panner) {
            src.panner.coneOuterAngle = value % 360;
          }
          break;
        case 4099:
          if (!Number.isFinite(value) || value <= 0) {
            AL.currentCtx.err = 40963;
            return;
          }
          if (src.pitch === value) {
            break;
          }
          src.pitch = value;
          AL.updateSourceRate(src);
          break;
        case 4100:
          if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.position[0] = value[0];
          src.position[1] = value[1];
          src.position[2] = value[2];
          AL.updateSourceSpace(src);
          break;
        case 4101:
          if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.direction[0] = value[0];
          src.direction[1] = value[1];
          src.direction[2] = value[2];
          AL.updateSourceSpace(src);
          break;
        case 4102:
          if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.velocity[0] = value[0];
          src.velocity[1] = value[1];
          src.velocity[2] = value[2];
          AL.updateSourceSpace(src);
          break;
        case 4103:
          if (value === 1) {
            src.looping = true;
            AL.updateSourceTime(src);
            if (src.type === 4136 && src.audioQueue.length > 0) {
              var audioSrc = src.audioQueue[0];
              audioSrc.loop = true;
              audioSrc._duration = Number.POSITIVE_INFINITY;
            }
          } else if (value === 0) {
            src.looping = false;
            var currentTime = AL.updateSourceTime(src);
            if (src.type === 4136 && src.audioQueue.length > 0) {
              var audioSrc = src.audioQueue[0];
              audioSrc.loop = false;
              audioSrc._duration = src.bufQueue[0].audioBuf.duration / src.playbackRate;
              audioSrc._startTime = currentTime - src.bufOffset / src.playbackRate;
            }
          } else {
            AL.currentCtx.err = 40963;
            return;
          }
          break;
        case 4105:
          if (src.state === 4114 || src.state === 4115) {
            AL.currentCtx.err = 40964;
            return;
          }
          if (value === 0) {
            for (var i2 in src.bufQueue) {
              src.bufQueue[i2].refCount--;
            }
            src.bufQueue.length = 1;
            src.bufQueue[0] = AL.buffers[0];
            src.bufsProcessed = 0;
            src.type = 4144;
          } else {
            var buf = AL.buffers[value];
            if (!buf) {
              AL.currentCtx.err = 40963;
              return;
            }
            for (var i2 in src.bufQueue) {
              src.bufQueue[i2].refCount--;
            }
            src.bufQueue.length = 0;
            buf.refCount++;
            src.bufQueue = [buf];
            src.bufsProcessed = 0;
            src.type = 4136;
          }
          AL.initSourcePanner(src);
          AL.scheduleSourceAudio(src);
          break;
        case 4106:
          if (!Number.isFinite(value) || value < 0) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.gain.gain.value = value;
          break;
        case 4109:
          if (!Number.isFinite(value) || value < 0 || value > Math.min(src.maxGain, 1)) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.minGain = value;
          break;
        case 4110:
          if (!Number.isFinite(value) || value < Math.max(0, src.minGain) || value > 1) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.maxGain = value;
          break;
        case 4128:
          if (!Number.isFinite(value) || value < 0) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.refDistance = value;
          if (src.panner) {
            src.panner.refDistance = value;
          }
          break;
        case 4129:
          if (!Number.isFinite(value) || value < 0) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.rolloffFactor = value;
          if (src.panner) {
            src.panner.rolloffFactor = value;
          }
          break;
        case 4130:
          if (!Number.isFinite(value) || value < 0 || value > 1) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.coneOuterGain = value;
          if (src.panner) {
            src.panner.coneOuterGain = value;
          }
          break;
        case 4131:
          if (!Number.isFinite(value) || value < 0) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.maxDistance = value;
          if (src.panner) {
            src.panner.maxDistance = value;
          }
          break;
        case 4132:
          if (value < 0 || value > AL.sourceDuration(src)) {
            AL.currentCtx.err = 40963;
            return;
          }
          AL.sourceSeek(src, value);
          break;
        case 4133:
          var srcLen = AL.sourceDuration(src);
          if (srcLen > 0) {
            var frequency;
            for (var bufId in src.bufQueue) {
              if (bufId) {
                frequency = src.bufQueue[bufId].frequency;
                break;
              }
            }
            value /= frequency;
          }
          if (value < 0 || value > srcLen) {
            AL.currentCtx.err = 40963;
            return;
          }
          AL.sourceSeek(src, value);
          break;
        case 4134:
          var srcLen = AL.sourceDuration(src);
          if (srcLen > 0) {
            var bytesPerSec;
            for (var bufId in src.bufQueue) {
              if (bufId) {
                var buf = src.bufQueue[bufId];
                bytesPerSec = buf.frequency * buf.bytesPerSample * buf.channels;
                break;
              }
            }
            value /= bytesPerSec;
          }
          if (value < 0 || value > srcLen) {
            AL.currentCtx.err = 40963;
            return;
          }
          AL.sourceSeek(src, value);
          break;
        case 4628:
          if (value !== 0 && value !== 1 && value !== 2) {
            AL.currentCtx.err = 40963;
            return;
          }
          src.spatialize = value;
          AL.initSourcePanner(src);
          break;
        case 8201:
        case 8202:
        case 8203:
          AL.currentCtx.err = 40964;
          break;
        case 53248:
          switch (value) {
            case 0:
            case 53249:
            case 53250:
            case 53251:
            case 53252:
            case 53253:
            case 53254:
              src.distanceModel = value;
              if (AL.currentCtx.sourceDistanceModel) {
                AL.updateContextGlobal(AL.currentCtx);
              }
              break;
            default:
              AL.currentCtx.err = 40963;
              return;
          }
          break;
        default:
          AL.currentCtx.err = 40962;
          return;
      }
    }, captures: {}, sharedCaptureAudioCtx: null, requireValidCaptureDevice: function(deviceId, funcname) {
      if (deviceId === 0) {
        AL.alcErr = 40961;
        return null;
      }
      var c = AL.captures[deviceId];
      if (!c) {
        AL.alcErr = 40961;
        return null;
      }
      var err2 = c.mediaStreamError;
      if (err2) {
        AL.alcErr = 40961;
        return null;
      }
      return c;
    }};
    function _alBufferData(bufferId, format, pData, size, freq) {
      if (!AL.currentCtx) {
        return;
      }
      var buf = AL.buffers[bufferId];
      if (!buf) {
        AL.currentCtx.err = 40963;
        return;
      }
      if (freq <= 0) {
        AL.currentCtx.err = 40963;
        return;
      }
      var audioBuf = null;
      try {
        switch (format) {
          case 4352:
            if (size > 0) {
              audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size, freq);
              var channel0 = audioBuf.getChannelData(0);
              for (var i2 = 0; i2 < size; ++i2) {
                channel0[i2] = HEAPU8[pData++] * 78125e-7 - 1;
              }
            }
            buf.bytesPerSample = 1;
            buf.channels = 1;
            buf.length = size;
            break;
          case 4353:
            if (size > 0) {
              audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 1, freq);
              var channel0 = audioBuf.getChannelData(0);
              pData >>= 1;
              for (var i2 = 0; i2 < size >> 1; ++i2) {
                channel0[i2] = HEAP16[pData++] * 30517578125e-15;
              }
            }
            buf.bytesPerSample = 2;
            buf.channels = 1;
            buf.length = size >> 1;
            break;
          case 4354:
            if (size > 0) {
              audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 1, freq);
              var channel0 = audioBuf.getChannelData(0);
              var channel1 = audioBuf.getChannelData(1);
              for (var i2 = 0; i2 < size >> 1; ++i2) {
                channel0[i2] = HEAPU8[pData++] * 78125e-7 - 1;
                channel1[i2] = HEAPU8[pData++] * 78125e-7 - 1;
              }
            }
            buf.bytesPerSample = 1;
            buf.channels = 2;
            buf.length = size >> 1;
            break;
          case 4355:
            if (size > 0) {
              audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 2, freq);
              var channel0 = audioBuf.getChannelData(0);
              var channel1 = audioBuf.getChannelData(1);
              pData >>= 1;
              for (var i2 = 0; i2 < size >> 2; ++i2) {
                channel0[i2] = HEAP16[pData++] * 30517578125e-15;
                channel1[i2] = HEAP16[pData++] * 30517578125e-15;
              }
            }
            buf.bytesPerSample = 2;
            buf.channels = 2;
            buf.length = size >> 2;
            break;
          case 65552:
            if (size > 0) {
              audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 2, freq);
              var channel0 = audioBuf.getChannelData(0);
              pData >>= 2;
              for (var i2 = 0; i2 < size >> 2; ++i2) {
                channel0[i2] = HEAPF32[pData++];
              }
            }
            buf.bytesPerSample = 4;
            buf.channels = 1;
            buf.length = size >> 2;
            break;
          case 65553:
            if (size > 0) {
              audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 3, freq);
              var channel0 = audioBuf.getChannelData(0);
              var channel1 = audioBuf.getChannelData(1);
              pData >>= 2;
              for (var i2 = 0; i2 < size >> 3; ++i2) {
                channel0[i2] = HEAPF32[pData++];
                channel1[i2] = HEAPF32[pData++];
              }
            }
            buf.bytesPerSample = 4;
            buf.channels = 2;
            buf.length = size >> 3;
            break;
          default:
            AL.currentCtx.err = 40963;
            return;
        }
        buf.frequency = freq;
        buf.audioBuf = audioBuf;
      } catch (e) {
        AL.currentCtx.err = 40963;
        return;
      }
    }
    function _alDeleteBuffers(count, pBufferIds) {
      if (!AL.currentCtx) {
        return;
      }
      for (var i2 = 0; i2 < count; ++i2) {
        var bufId = HEAP32[pBufferIds + i2 * 4 >> 2];
        if (bufId === 0) {
          continue;
        }
        if (!AL.buffers[bufId]) {
          AL.currentCtx.err = 40961;
          return;
        }
        if (AL.buffers[bufId].refCount) {
          AL.currentCtx.err = 40964;
          return;
        }
      }
      for (var i2 = 0; i2 < count; ++i2) {
        var bufId = HEAP32[pBufferIds + i2 * 4 >> 2];
        if (bufId === 0) {
          continue;
        }
        AL.deviceRefCounts[AL.buffers[bufId].deviceId]--;
        delete AL.buffers[bufId];
        AL.freeIds.push(bufId);
      }
    }
    function _alGenBuffers(count, pBufferIds) {
      if (!AL.currentCtx) {
        return;
      }
      for (var i2 = 0; i2 < count; ++i2) {
        var buf = {deviceId: AL.currentCtx.deviceId, id: AL.newId(), refCount: 0, audioBuf: null, frequency: 0, bytesPerSample: 2, channels: 1, length: 0};
        AL.deviceRefCounts[buf.deviceId]++;
        AL.buffers[buf.id] = buf;
        HEAP32[pBufferIds + i2 * 4 >> 2] = buf.id;
      }
    }
    function _alGenSources(count, pSourceIds) {
      if (!AL.currentCtx) {
        return;
      }
      for (var i2 = 0; i2 < count; ++i2) {
        var gain = AL.currentCtx.audioCtx.createGain();
        gain.connect(AL.currentCtx.gain);
        var src = {context: AL.currentCtx, id: AL.newId(), type: 4144, state: 4113, bufQueue: [AL.buffers[0]], audioQueue: [], looping: false, pitch: 1, dopplerShift: 1, gain, minGain: 0, maxGain: 1, panner: null, bufsProcessed: 0, bufStartTime: Number.NEGATIVE_INFINITY, bufOffset: 0, relative: false, refDistance: 1, maxDistance: 340282e33, rolloffFactor: 1, position: [0, 0, 0], velocity: [0, 0, 0], direction: [0, 0, 0], coneOuterGain: 0, coneInnerAngle: 360, coneOuterAngle: 360, distanceModel: 53250, spatialize: 2, get playbackRate() {
          return this.pitch * this.dopplerShift;
        }};
        AL.currentCtx.sources[src.id] = src;
        HEAP32[pSourceIds + i2 * 4 >> 2] = src.id;
      }
    }
    function _alGetSourcei(sourceId, param, pValue) {
      var val = AL.getSourceParam("alGetSourcei", sourceId, param);
      if (val === null) {
        return;
      }
      if (!pValue) {
        AL.currentCtx.err = 40963;
        return;
      }
      switch (param) {
        case 514:
        case 4097:
        case 4098:
        case 4103:
        case 4105:
        case 4112:
        case 4117:
        case 4118:
        case 4128:
        case 4129:
        case 4131:
        case 4132:
        case 4133:
        case 4134:
        case 4135:
        case 4628:
        case 8201:
        case 8202:
        case 53248:
          HEAP32[pValue >> 2] = val;
          break;
        default:
          AL.currentCtx.err = 40962;
          return;
      }
    }
    function _alListener3f(param, value0, value1, value2) {
      switch (param) {
        case 4100:
        case 4102:
          AL.paramArray[0] = value0;
          AL.paramArray[1] = value1;
          AL.paramArray[2] = value2;
          AL.setListenerParam("alListener3f", param, AL.paramArray);
          break;
        default:
          AL.setListenerParam("alListener3f", param, null);
          break;
      }
    }
    function _alListenerfv(param, pValues) {
      if (!AL.currentCtx) {
        return;
      }
      if (!pValues) {
        AL.currentCtx.err = 40963;
        return;
      }
      switch (param) {
        case 4100:
        case 4102:
          AL.paramArray[0] = HEAPF32[pValues >> 2];
          AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
          AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
          AL.setListenerParam("alListenerfv", param, AL.paramArray);
          break;
        case 4111:
          AL.paramArray[0] = HEAPF32[pValues >> 2];
          AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
          AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
          AL.paramArray[3] = HEAPF32[pValues + 12 >> 2];
          AL.paramArray[4] = HEAPF32[pValues + 16 >> 2];
          AL.paramArray[5] = HEAPF32[pValues + 20 >> 2];
          AL.setListenerParam("alListenerfv", param, AL.paramArray);
          break;
        default:
          AL.setListenerParam("alListenerfv", param, null);
          break;
      }
    }
    function _alSourcePlay(sourceId) {
      if (!AL.currentCtx) {
        return;
      }
      var src = AL.currentCtx.sources[sourceId];
      if (!src) {
        AL.currentCtx.err = 40961;
        return;
      }
      AL.setSourceState(src, 4114);
    }
    function _alSourceQueueBuffers(sourceId, count, pBufferIds) {
      if (!AL.currentCtx) {
        return;
      }
      var src = AL.currentCtx.sources[sourceId];
      if (!src) {
        AL.currentCtx.err = 40961;
        return;
      }
      if (src.type === 4136) {
        AL.currentCtx.err = 40964;
        return;
      }
      if (count === 0) {
        return;
      }
      var templateBuf = AL.buffers[0];
      for (var i2 = 0; i2 < src.bufQueue.length; i2++) {
        if (src.bufQueue[i2].id !== 0) {
          templateBuf = src.bufQueue[i2];
          break;
        }
      }
      for (var i2 = 0; i2 < count; ++i2) {
        var bufId = HEAP32[pBufferIds + i2 * 4 >> 2];
        var buf = AL.buffers[bufId];
        if (!buf) {
          AL.currentCtx.err = 40961;
          return;
        }
        if (templateBuf.id !== 0 && (buf.frequency !== templateBuf.frequency || buf.bytesPerSample !== templateBuf.bytesPerSample || buf.channels !== templateBuf.channels)) {
          AL.currentCtx.err = 40964;
        }
      }
      if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
        src.bufQueue.length = 0;
      }
      src.type = 4137;
      for (var i2 = 0; i2 < count; ++i2) {
        var bufId = HEAP32[pBufferIds + i2 * 4 >> 2];
        var buf = AL.buffers[bufId];
        buf.refCount++;
        src.bufQueue.push(buf);
      }
      if (src.looping) {
        AL.cancelPendingSourceAudio(src);
      }
      AL.initSourcePanner(src);
      AL.scheduleSourceAudio(src);
    }
    function _alSourceStop(sourceId) {
      if (!AL.currentCtx) {
        return;
      }
      var src = AL.currentCtx.sources[sourceId];
      if (!src) {
        AL.currentCtx.err = 40961;
        return;
      }
      AL.setSourceState(src, 4116);
    }
    function _alSourceUnqueueBuffers(sourceId, count, pBufferIds) {
      if (!AL.currentCtx) {
        return;
      }
      var src = AL.currentCtx.sources[sourceId];
      if (!src) {
        AL.currentCtx.err = 40961;
        return;
      }
      if (count > (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 ? 0 : src.bufsProcessed)) {
        AL.currentCtx.err = 40963;
        return;
      }
      if (count === 0) {
        return;
      }
      for (var i2 = 0; i2 < count; i2++) {
        var buf = src.bufQueue.shift();
        buf.refCount--;
        HEAP32[pBufferIds + i2 * 4 >> 2] = buf.id;
        src.bufsProcessed--;
      }
      if (src.bufQueue.length === 0) {
        src.bufQueue.push(AL.buffers[0]);
      }
      AL.initSourcePanner(src);
      AL.scheduleSourceAudio(src);
    }
    function _alSourcef(sourceId, param, value) {
      switch (param) {
        case 4097:
        case 4098:
        case 4099:
        case 4106:
        case 4109:
        case 4110:
        case 4128:
        case 4129:
        case 4130:
        case 4131:
        case 4132:
        case 4133:
        case 4134:
        case 8203:
          AL.setSourceParam("alSourcef", sourceId, param, value);
          break;
        default:
          AL.setSourceParam("alSourcef", sourceId, param, null);
          break;
      }
    }
    function _alcCreateContext(deviceId, pAttrList) {
      if (!(deviceId in AL.deviceRefCounts)) {
        AL.alcErr = 40961;
        return 0;
      }
      var options = null;
      var attrs = [];
      var hrtf = null;
      pAttrList >>= 2;
      if (pAttrList) {
        var attr = 0;
        var val = 0;
        while (true) {
          attr = HEAP32[pAttrList++];
          attrs.push(attr);
          if (attr === 0) {
            break;
          }
          val = HEAP32[pAttrList++];
          attrs.push(val);
          switch (attr) {
            case 4103:
              if (!options) {
                options = {};
              }
              options.sampleRate = val;
              break;
            case 4112:
            case 4113:
              break;
            case 6546:
              switch (val) {
                case 0:
                  hrtf = false;
                  break;
                case 1:
                  hrtf = true;
                  break;
                case 2:
                  break;
                default:
                  AL.alcErr = 40964;
                  return 0;
              }
              break;
            case 6550:
              if (val !== 0) {
                AL.alcErr = 40964;
                return 0;
              }
              break;
            default:
              AL.alcErr = 40964;
              return 0;
          }
        }
      }
      var AudioContext2 = window.AudioContext || window.webkitAudioContext;
      var ac = null;
      try {
        if (options) {
          ac = new AudioContext2(options);
        } else {
          ac = new AudioContext2();
        }
      } catch (e) {
        if (e.name === "NotSupportedError") {
          AL.alcErr = 40964;
        } else {
          AL.alcErr = 40961;
        }
        return 0;
      }
      autoResumeAudioContext(ac);
      if (typeof ac.createGain === "undefined") {
        ac.createGain = ac.createGainNode;
      }
      var gain = ac.createGain();
      gain.connect(ac.destination);
      var ctx = {deviceId, id: AL.newId(), attrs, audioCtx: ac, listener: {position: [0, 0, 0], velocity: [0, 0, 0], direction: [0, 0, 0], up: [0, 0, 0]}, sources: [], interval: setInterval(function() {
        AL.scheduleContextAudio(ctx);
      }, AL.QUEUE_INTERVAL), gain, distanceModel: 53250, speedOfSound: 343.3, dopplerFactor: 1, sourceDistanceModel: false, hrtf: hrtf || false, _err: 0, get err() {
        return this._err;
      }, set err(val2) {
        if (this._err === 0 || val2 === 0) {
          this._err = val2;
        }
      }};
      AL.deviceRefCounts[deviceId]++;
      AL.contexts[ctx.id] = ctx;
      if (hrtf !== null) {
        for (var ctxId in AL.contexts) {
          var c = AL.contexts[ctxId];
          if (c.deviceId === deviceId) {
            c.hrtf = hrtf;
            AL.updateContextGlobal(c);
          }
        }
      }
      return ctx.id;
    }
    function _alcMakeContextCurrent(contextId) {
      if (contextId === 0) {
        AL.currentCtx = null;
        return 0;
      } else {
        AL.currentCtx = AL.contexts[contextId];
        return 1;
      }
    }
    function _alcOpenDevice(pDeviceName) {
      if (pDeviceName) {
        var name = UTF8ToString(pDeviceName);
        if (name !== AL.DEVICE_NAME) {
          return 0;
        }
      }
      if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
        var deviceId = AL.newId();
        AL.deviceRefCounts[deviceId] = 0;
        return deviceId;
      } else {
        return 0;
      }
    }
    function _clock() {
      if (_clock.start === void 0)
        _clock.start = Date.now();
      return (Date.now() - _clock.start) * (1e6 / 1e3) | 0;
    }
    var _emscripten_get_now_is_monotonic = true;
    function _clock_gettime(clk_id, tp) {
      var now;
      if (clk_id === 0) {
        now = Date.now();
      } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
        now = _emscripten_get_now();
      } else {
        setErrNo(28);
        return -1;
      }
      HEAP32[tp >> 2] = now / 1e3 | 0;
      HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
      return 0;
    }
    function _dlclose(handle) {
      abort("To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking");
    }
    var EGL = {errorCode: 12288, defaultDisplayInitialized: false, currentContext: 0, currentReadSurface: 0, currentDrawSurface: 0, contextAttributes: {alpha: false, depth: false, stencil: false, antialias: false}, stringCache: {}, setErrorCode: function(code) {
      EGL.errorCode = code;
    }, chooseConfig: function(display, attribList, config, config_size, numConfigs) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      if (attribList) {
        for (; ; ) {
          var param = HEAP32[attribList >> 2];
          if (param == 12321) {
            var alphaSize = HEAP32[attribList + 4 >> 2];
            EGL.contextAttributes.alpha = alphaSize > 0;
          } else if (param == 12325) {
            var depthSize = HEAP32[attribList + 4 >> 2];
            EGL.contextAttributes.depth = depthSize > 0;
          } else if (param == 12326) {
            var stencilSize = HEAP32[attribList + 4 >> 2];
            EGL.contextAttributes.stencil = stencilSize > 0;
          } else if (param == 12337) {
            var samples = HEAP32[attribList + 4 >> 2];
            EGL.contextAttributes.antialias = samples > 0;
          } else if (param == 12338) {
            var samples = HEAP32[attribList + 4 >> 2];
            EGL.contextAttributes.antialias = samples == 1;
          } else if (param == 12544) {
            var requestedPriority = HEAP32[attribList + 4 >> 2];
            EGL.contextAttributes.lowLatency = requestedPriority != 12547;
          } else if (param == 12344) {
            break;
          }
          attribList += 8;
        }
      }
      if ((!config || !config_size) && !numConfigs) {
        EGL.setErrorCode(12300);
        return 0;
      }
      if (numConfigs) {
        HEAP32[numConfigs >> 2] = 1;
      }
      if (config && config_size > 0) {
        HEAP32[config >> 2] = 62002;
      }
      EGL.setErrorCode(12288);
      return 1;
    }};
    function _eglBindAPI(api) {
      if (api == 12448) {
        EGL.setErrorCode(12288);
        return 1;
      } else {
        EGL.setErrorCode(12300);
        return 0;
      }
    }
    function _eglChooseConfig(display, attrib_list, configs, config_size, numConfigs) {
      return EGL.chooseConfig(display, attrib_list, configs, config_size, numConfigs);
    }
    function __webgl_enable_ANGLE_instanced_arrays(ctx) {
      var ext = ctx.getExtension("ANGLE_instanced_arrays");
      if (ext) {
        ctx["vertexAttribDivisor"] = function(index, divisor) {
          ext["vertexAttribDivisorANGLE"](index, divisor);
        };
        ctx["drawArraysInstanced"] = function(mode, first, count, primcount) {
          ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
        };
        ctx["drawElementsInstanced"] = function(mode, count, type, indices, primcount) {
          ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
        };
        return 1;
      }
    }
    function __webgl_enable_OES_vertex_array_object(ctx) {
      var ext = ctx.getExtension("OES_vertex_array_object");
      if (ext) {
        ctx["createVertexArray"] = function() {
          return ext["createVertexArrayOES"]();
        };
        ctx["deleteVertexArray"] = function(vao) {
          ext["deleteVertexArrayOES"](vao);
        };
        ctx["bindVertexArray"] = function(vao) {
          ext["bindVertexArrayOES"](vao);
        };
        ctx["isVertexArray"] = function(vao) {
          return ext["isVertexArrayOES"](vao);
        };
        return 1;
      }
    }
    function __webgl_enable_WEBGL_draw_buffers(ctx) {
      var ext = ctx.getExtension("WEBGL_draw_buffers");
      if (ext) {
        ctx["drawBuffers"] = function(n, bufs) {
          ext["drawBuffersWEBGL"](n, bufs);
        };
        return 1;
      }
    }
    function __webgl_enable_WEBGL_multi_draw(ctx) {
      return !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
    }
    var GL = {counter: 1, buffers: [], programs: [], framebuffers: [], renderbuffers: [], textures: [], uniforms: [], shaders: [], vaos: [], contexts: [], offscreenCanvases: {}, timerQueriesEXT: [], programInfos: {}, stringCache: {}, unpackAlignment: 4, recordError: function recordError(errorCode) {
      if (!GL.lastError) {
        GL.lastError = errorCode;
      }
    }, getNewId: function(table) {
      var ret = GL.counter++;
      for (var i2 = table.length; i2 < ret; i2++) {
        table[i2] = null;
      }
      return ret;
    }, getSource: function(shader, count, string, length) {
      var source = "";
      for (var i2 = 0; i2 < count; ++i2) {
        var len = length ? HEAP32[length + i2 * 4 >> 2] : -1;
        source += UTF8ToString(HEAP32[string + i2 * 4 >> 2], len < 0 ? void 0 : len);
      }
      return source;
    }, createContext: function(canvas2, webGLContextAttributes) {
      var ctx = canvas2.getContext("webgl", webGLContextAttributes);
      if (!ctx)
        return 0;
      var handle = GL.registerContext(ctx, webGLContextAttributes);
      return handle;
    }, registerContext: function(ctx, webGLContextAttributes) {
      var handle = GL.getNewId(GL.contexts);
      var context = {handle, attributes: webGLContextAttributes, version: webGLContextAttributes.majorVersion, GLctx: ctx};
      if (ctx.canvas)
        ctx.canvas.GLctxObject = context;
      GL.contexts[handle] = context;
      if (typeof webGLContextAttributes.enableExtensionsByDefault === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
        GL.initExtensions(context);
      }
      return handle;
    }, makeContextCurrent: function(contextHandle) {
      GL.currentContext = GL.contexts[contextHandle];
      Module2.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
      return !(contextHandle && !GLctx);
    }, getContext: function(contextHandle) {
      return GL.contexts[contextHandle];
    }, deleteContext: function(contextHandle) {
      if (GL.currentContext === GL.contexts[contextHandle])
        GL.currentContext = null;
      if (typeof JSEvents === "object")
        JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
      if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas)
        GL.contexts[contextHandle].GLctx.canvas.GLctxObject = void 0;
      GL.contexts[contextHandle] = null;
    }, initExtensions: function(context) {
      if (!context)
        context = GL.currentContext;
      if (context.initExtensionsDone)
        return;
      context.initExtensionsDone = true;
      var GLctx2 = context.GLctx;
      __webgl_enable_ANGLE_instanced_arrays(GLctx2);
      __webgl_enable_OES_vertex_array_object(GLctx2);
      __webgl_enable_WEBGL_draw_buffers(GLctx2);
      GLctx2.disjointTimerQueryExt = GLctx2.getExtension("EXT_disjoint_timer_query");
      __webgl_enable_WEBGL_multi_draw(GLctx2);
      var exts = GLctx2.getSupportedExtensions() || [];
      exts.forEach(function(ext) {
        if (ext.indexOf("lose_context") < 0 && ext.indexOf("debug") < 0) {
          GLctx2.getExtension(ext);
        }
      });
    }, populateUniformTable: function(program) {
      var p = GL.programs[program];
      var ptable = GL.programInfos[program] = {uniforms: {}, maxUniformLength: 0, maxAttributeLength: -1, maxUniformBlockNameLength: -1};
      var utable = ptable.uniforms;
      var numUniforms = GLctx.getProgramParameter(p, 35718);
      for (var i2 = 0; i2 < numUniforms; ++i2) {
        var u = GLctx.getActiveUniform(p, i2);
        var name = u.name;
        ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
        if (name.slice(-1) == "]") {
          name = name.slice(0, name.lastIndexOf("["));
        }
        var loc = GLctx.getUniformLocation(p, name);
        if (loc) {
          var id = GL.getNewId(GL.uniforms);
          utable[name] = [u.size, id];
          GL.uniforms[id] = loc;
          for (var j = 1; j < u.size; ++j) {
            var n = name + "[" + j + "]";
            loc = GLctx.getUniformLocation(p, n);
            id = GL.getNewId(GL.uniforms);
            GL.uniforms[id] = loc;
          }
        }
      }
    }};
    function _eglCreateContext(display, config, hmm, contextAttribs) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      var glesContextVersion = 1;
      for (; ; ) {
        var param = HEAP32[contextAttribs >> 2];
        if (param == 12440) {
          glesContextVersion = HEAP32[contextAttribs + 4 >> 2];
        } else if (param == 12344) {
          break;
        } else {
          EGL.setErrorCode(12292);
          return 0;
        }
        contextAttribs += 8;
      }
      if (glesContextVersion != 2) {
        EGL.setErrorCode(12293);
        return 0;
      }
      EGL.contextAttributes.majorVersion = glesContextVersion - 1;
      EGL.contextAttributes.minorVersion = 0;
      EGL.context = GL.createContext(Module2["canvas"], EGL.contextAttributes);
      if (EGL.context != 0) {
        EGL.setErrorCode(12288);
        GL.makeContextCurrent(EGL.context);
        Module2.useWebGL = true;
        Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
          callback();
        });
        GL.makeContextCurrent(null);
        return 62004;
      } else {
        EGL.setErrorCode(12297);
        return 0;
      }
    }
    function _eglCreateWindowSurface(display, config, win, attrib_list) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      if (config != 62002) {
        EGL.setErrorCode(12293);
        return 0;
      }
      EGL.setErrorCode(12288);
      return 62006;
    }
    function _eglDestroyContext(display, context) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      if (context != 62004) {
        EGL.setErrorCode(12294);
        return 0;
      }
      GL.deleteContext(EGL.context);
      EGL.setErrorCode(12288);
      if (EGL.currentContext == context) {
        EGL.currentContext = 0;
      }
      return 1;
    }
    function _eglDestroySurface(display, surface) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      if (surface != 62006) {
        EGL.setErrorCode(12301);
        return 1;
      }
      if (EGL.currentReadSurface == surface) {
        EGL.currentReadSurface = 0;
      }
      if (EGL.currentDrawSurface == surface) {
        EGL.currentDrawSurface = 0;
      }
      EGL.setErrorCode(12288);
      return 1;
    }
    function _eglGetConfigAttrib(display, config, attribute, value) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      if (config != 62002) {
        EGL.setErrorCode(12293);
        return 0;
      }
      if (!value) {
        EGL.setErrorCode(12300);
        return 0;
      }
      EGL.setErrorCode(12288);
      switch (attribute) {
        case 12320:
          HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 32 : 24;
          return 1;
        case 12321:
          HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 8 : 0;
          return 1;
        case 12322:
          HEAP32[value >> 2] = 8;
          return 1;
        case 12323:
          HEAP32[value >> 2] = 8;
          return 1;
        case 12324:
          HEAP32[value >> 2] = 8;
          return 1;
        case 12325:
          HEAP32[value >> 2] = EGL.contextAttributes.depth ? 24 : 0;
          return 1;
        case 12326:
          HEAP32[value >> 2] = EGL.contextAttributes.stencil ? 8 : 0;
          return 1;
        case 12327:
          HEAP32[value >> 2] = 12344;
          return 1;
        case 12328:
          HEAP32[value >> 2] = 62002;
          return 1;
        case 12329:
          HEAP32[value >> 2] = 0;
          return 1;
        case 12330:
          HEAP32[value >> 2] = 4096;
          return 1;
        case 12331:
          HEAP32[value >> 2] = 16777216;
          return 1;
        case 12332:
          HEAP32[value >> 2] = 4096;
          return 1;
        case 12333:
          HEAP32[value >> 2] = 0;
          return 1;
        case 12334:
          HEAP32[value >> 2] = 0;
          return 1;
        case 12335:
          HEAP32[value >> 2] = 12344;
          return 1;
        case 12337:
          HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 4 : 0;
          return 1;
        case 12338:
          HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 1 : 0;
          return 1;
        case 12339:
          HEAP32[value >> 2] = 4;
          return 1;
        case 12340:
          HEAP32[value >> 2] = 12344;
          return 1;
        case 12341:
        case 12342:
        case 12343:
          HEAP32[value >> 2] = -1;
          return 1;
        case 12345:
        case 12346:
          HEAP32[value >> 2] = 0;
          return 1;
        case 12347:
          HEAP32[value >> 2] = 0;
          return 1;
        case 12348:
          HEAP32[value >> 2] = 1;
          return 1;
        case 12349:
        case 12350:
          HEAP32[value >> 2] = 0;
          return 1;
        case 12351:
          HEAP32[value >> 2] = 12430;
          return 1;
        case 12352:
          HEAP32[value >> 2] = 4;
          return 1;
        case 12354:
          HEAP32[value >> 2] = 0;
          return 1;
        default:
          EGL.setErrorCode(12292);
          return 0;
      }
    }
    function _eglGetDisplay(nativeDisplayType) {
      EGL.setErrorCode(12288);
      return 62e3;
    }
    function _eglGetError() {
      return EGL.errorCode;
    }
    function _eglInitialize(display, majorVersion, minorVersion) {
      if (display == 62e3) {
        if (majorVersion) {
          HEAP32[majorVersion >> 2] = 1;
        }
        if (minorVersion) {
          HEAP32[minorVersion >> 2] = 4;
        }
        EGL.defaultDisplayInitialized = true;
        EGL.setErrorCode(12288);
        return 1;
      } else {
        EGL.setErrorCode(12296);
        return 0;
      }
    }
    function _eglMakeCurrent(display, draw, read, context) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      if (context != 0 && context != 62004) {
        EGL.setErrorCode(12294);
        return 0;
      }
      if (read != 0 && read != 62006 || draw != 0 && draw != 62006) {
        EGL.setErrorCode(12301);
        return 0;
      }
      GL.makeContextCurrent(context ? EGL.context : null);
      EGL.currentContext = context;
      EGL.currentDrawSurface = draw;
      EGL.currentReadSurface = read;
      EGL.setErrorCode(12288);
      return 1;
    }
    function _eglQueryString(display, name) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      EGL.setErrorCode(12288);
      if (EGL.stringCache[name])
        return EGL.stringCache[name];
      var ret;
      switch (name) {
        case 12371:
          ret = allocateUTF8("Emscripten");
          break;
        case 12372:
          ret = allocateUTF8("1.4 Emscripten EGL");
          break;
        case 12373:
          ret = allocateUTF8("");
          break;
        case 12429:
          ret = allocateUTF8("OpenGL_ES");
          break;
        default:
          EGL.setErrorCode(12300);
          return 0;
      }
      EGL.stringCache[name] = ret;
      return ret;
    }
    function _eglSwapBuffers() {
      if (!EGL.defaultDisplayInitialized) {
        EGL.setErrorCode(12289);
      } else if (!Module2.ctx) {
        EGL.setErrorCode(12290);
      } else if (Module2.ctx.isContextLost()) {
        EGL.setErrorCode(12302);
      } else {
        EGL.setErrorCode(12288);
        return 1;
      }
      return 0;
    }
    function _eglSwapInterval(display, interval) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      if (interval == 0)
        _emscripten_set_main_loop_timing(0, 0);
      else
        _emscripten_set_main_loop_timing(1, interval);
      EGL.setErrorCode(12288);
      return 1;
    }
    function _eglTerminate(display) {
      if (display != 62e3) {
        EGL.setErrorCode(12296);
        return 0;
      }
      EGL.currentContext = 0;
      EGL.currentReadSurface = 0;
      EGL.currentDrawSurface = 0;
      EGL.defaultDisplayInitialized = false;
      EGL.setErrorCode(12288);
      return 1;
    }
    function _eglWaitClient() {
      EGL.setErrorCode(12288);
      return 1;
    }
    function _eglWaitGL() {
      return _eglWaitClient();
    }
    function _eglWaitNative(nativeEngineId) {
      EGL.setErrorCode(12288);
      return 1;
    }
    function _emscripten_asm_const_int(code, sigPtr, argbuf) {
      var args = readAsmConstArgs(sigPtr, argbuf);
      return ASM_CONSTS[code].apply(null, args);
    }
    function _emscripten_cancel_main_loop() {
      Browser.mainLoop.pause();
      Browser.mainLoop.func = null;
    }
    var JSEvents = {inEventHandler: 0, removeAllEventListeners: function() {
      for (var i2 = JSEvents.eventHandlers.length - 1; i2 >= 0; --i2) {
        JSEvents._removeHandler(i2);
      }
      JSEvents.eventHandlers = [];
      JSEvents.deferredCalls = [];
    }, registerRemoveEventListeners: function() {
      if (!JSEvents.removeEventListenersRegistered) {
        JSEvents.removeEventListenersRegistered = true;
      }
    }, deferredCalls: [], deferCall: function(targetFunction, precedence, argsList) {
      function arraysHaveEqualContent(arrA, arrB) {
        if (arrA.length != arrB.length)
          return false;
        for (var i3 in arrA) {
          if (arrA[i3] != arrB[i3])
            return false;
        }
        return true;
      }
      for (var i2 in JSEvents.deferredCalls) {
        var call = JSEvents.deferredCalls[i2];
        if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
          return;
        }
      }
      JSEvents.deferredCalls.push({targetFunction, precedence, argsList});
      JSEvents.deferredCalls.sort(function(x, y) {
        return x.precedence < y.precedence;
      });
    }, removeDeferredCalls: function(targetFunction) {
      for (var i2 = 0; i2 < JSEvents.deferredCalls.length; ++i2) {
        if (JSEvents.deferredCalls[i2].targetFunction == targetFunction) {
          JSEvents.deferredCalls.splice(i2, 1);
          --i2;
        }
      }
    }, canPerformEventHandlerRequests: function() {
      return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
    }, runDeferredCalls: function() {
      if (!JSEvents.canPerformEventHandlerRequests()) {
        return;
      }
      for (var i2 = 0; i2 < JSEvents.deferredCalls.length; ++i2) {
        var call = JSEvents.deferredCalls[i2];
        JSEvents.deferredCalls.splice(i2, 1);
        --i2;
        call.targetFunction.apply(null, call.argsList);
      }
    }, eventHandlers: [], removeAllHandlersOnTarget: function(target, eventTypeString) {
      for (var i2 = 0; i2 < JSEvents.eventHandlers.length; ++i2) {
        if (JSEvents.eventHandlers[i2].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i2].eventTypeString)) {
          JSEvents._removeHandler(i2--);
        }
      }
    }, _removeHandler: function(i2) {
      var h = JSEvents.eventHandlers[i2];
      h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
      JSEvents.eventHandlers.splice(i2, 1);
    }, registerOrRemoveHandler: function(eventHandler) {
      var jsEventHandler = function jsEventHandler2(event2) {
        ++JSEvents.inEventHandler;
        JSEvents.currentEventHandler = eventHandler;
        JSEvents.runDeferredCalls();
        eventHandler.handlerFunc(event2);
        JSEvents.runDeferredCalls();
        --JSEvents.inEventHandler;
      };
      if (eventHandler.callbackfunc) {
        eventHandler.eventListenerFunc = jsEventHandler;
        eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
        JSEvents.eventHandlers.push(eventHandler);
        JSEvents.registerRemoveEventListeners();
      } else {
        for (var i2 = 0; i2 < JSEvents.eventHandlers.length; ++i2) {
          if (JSEvents.eventHandlers[i2].target == eventHandler.target && JSEvents.eventHandlers[i2].eventTypeString == eventHandler.eventTypeString) {
            JSEvents._removeHandler(i2--);
          }
        }
      }
    }, getNodeNameForTarget: function(target) {
      if (!target)
        return "";
      if (target == window)
        return "#window";
      if (target == screen)
        return "#screen";
      return target && target.nodeName ? target.nodeName : "";
    }, fullscreenEnabled: function() {
      return document.fullscreenEnabled || document.webkitFullscreenEnabled;
    }};
    var currentFullscreenStrategy = {};
    function maybeCStringToJsString(cString) {
      return cString > 2 ? UTF8ToString(cString) : cString;
    }
    var specialHTMLTargets = [0, document, window];
    function findEventTarget(target) {
      target = maybeCStringToJsString(target);
      var domElement = specialHTMLTargets[target] || document.querySelector(target.replace("#canvas", "#byuuCanvas"));
      return domElement;
    }
    function findCanvasEventTarget(target) {
      return findEventTarget(target);
    }
    function _emscripten_get_canvas_element_size(target, width, height) {
      var canvas2 = findCanvasEventTarget(target);
      if (!canvas2)
        return -4;
      HEAP32[width >> 2] = canvas2.width;
      HEAP32[height >> 2] = canvas2.height;
    }
    function getCanvasElementSize(target) {
      var stackTop = stackSave();
      var w = stackAlloc(8);
      var h = w + 4;
      var targetInt = stackAlloc(target.id.length + 1);
      stringToUTF8(target.id, targetInt, target.id.length + 1);
      var ret = _emscripten_get_canvas_element_size(targetInt, w, h);
      var size = [HEAP32[w >> 2], HEAP32[h >> 2]];
      stackRestore(stackTop);
      return size;
    }
    function _emscripten_set_canvas_element_size(target, width, height) {
      var canvas2 = findCanvasEventTarget(target);
      if (!canvas2)
        return -4;
      canvas2.width = width;
      canvas2.height = height;
      return 0;
    }
    function setCanvasElementSize(target, width, height) {
      if (!target.controlTransferredOffscreen) {
        target.width = width;
        target.height = height;
      } else {
        var stackTop = stackSave();
        var targetInt = stackAlloc(target.id.length + 1);
        stringToUTF8(target.id, targetInt, target.id.length + 1);
        _emscripten_set_canvas_element_size(targetInt, width, height);
        stackRestore(stackTop);
      }
    }
    function registerRestoreOldStyle(canvas2) {
      var canvasSize = getCanvasElementSize(canvas2);
      var oldWidth = canvasSize[0];
      var oldHeight = canvasSize[1];
      var oldCssWidth = canvas2.style.width;
      var oldCssHeight = canvas2.style.height;
      var oldBackgroundColor = canvas2.style.backgroundColor;
      var oldDocumentBackgroundColor = document.body.style.backgroundColor;
      var oldPaddingLeft = canvas2.style.paddingLeft;
      var oldPaddingRight = canvas2.style.paddingRight;
      var oldPaddingTop = canvas2.style.paddingTop;
      var oldPaddingBottom = canvas2.style.paddingBottom;
      var oldMarginLeft = canvas2.style.marginLeft;
      var oldMarginRight = canvas2.style.marginRight;
      var oldMarginTop = canvas2.style.marginTop;
      var oldMarginBottom = canvas2.style.marginBottom;
      var oldDocumentBodyMargin = document.body.style.margin;
      var oldDocumentOverflow = document.documentElement.style.overflow;
      var oldDocumentScroll = document.body.scroll;
      var oldImageRendering = canvas2.style.imageRendering;
      function restoreOldStyle() {
        var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        if (!fullscreenElement) {
          document.removeEventListener("fullscreenchange", restoreOldStyle);
          document.removeEventListener("webkitfullscreenchange", restoreOldStyle);
          setCanvasElementSize(canvas2, oldWidth, oldHeight);
          canvas2.style.width = oldCssWidth;
          canvas2.style.height = oldCssHeight;
          canvas2.style.backgroundColor = oldBackgroundColor;
          if (!oldDocumentBackgroundColor)
            document.body.style.backgroundColor = "white";
          document.body.style.backgroundColor = oldDocumentBackgroundColor;
          canvas2.style.paddingLeft = oldPaddingLeft;
          canvas2.style.paddingRight = oldPaddingRight;
          canvas2.style.paddingTop = oldPaddingTop;
          canvas2.style.paddingBottom = oldPaddingBottom;
          canvas2.style.marginLeft = oldMarginLeft;
          canvas2.style.marginRight = oldMarginRight;
          canvas2.style.marginTop = oldMarginTop;
          canvas2.style.marginBottom = oldMarginBottom;
          document.body.style.margin = oldDocumentBodyMargin;
          document.documentElement.style.overflow = oldDocumentOverflow;
          document.body.scroll = oldDocumentScroll;
          canvas2.style.imageRendering = oldImageRendering;
          if (canvas2.GLctxObject)
            canvas2.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
          if (currentFullscreenStrategy.canvasResizedCallback) {
            wasmTable.get(currentFullscreenStrategy.canvasResizedCallback)(37, 0, currentFullscreenStrategy.canvasResizedCallbackUserData);
          }
        }
      }
      document.addEventListener("fullscreenchange", restoreOldStyle);
      document.addEventListener("webkitfullscreenchange", restoreOldStyle);
      return restoreOldStyle;
    }
    function setLetterbox(element, topBottom, leftRight) {
      element.style.paddingLeft = element.style.paddingRight = leftRight + "px";
      element.style.paddingTop = element.style.paddingBottom = topBottom + "px";
    }
    function getBoundingClientRect(e) {
      return specialHTMLTargets.indexOf(e) < 0 ? e.getBoundingClientRect() : {left: 0, top: 0};
    }
    function _JSEvents_resizeCanvasForFullscreen(target, strategy) {
      var restoreOldStyle = registerRestoreOldStyle(target);
      var cssWidth = strategy.softFullscreen ? innerWidth : screen.width;
      var cssHeight = strategy.softFullscreen ? innerHeight : screen.height;
      var rect = getBoundingClientRect(target);
      var windowedCssWidth = rect.width;
      var windowedCssHeight = rect.height;
      var canvasSize = getCanvasElementSize(target);
      var windowedRttWidth = canvasSize[0];
      var windowedRttHeight = canvasSize[1];
      if (strategy.scaleMode == 3) {
        setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
        cssWidth = windowedCssWidth;
        cssHeight = windowedCssHeight;
      } else if (strategy.scaleMode == 2) {
        if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
          var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
          setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
          cssHeight = desiredCssHeight;
        } else {
          var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
          setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
          cssWidth = desiredCssWidth;
        }
      }
      if (!target.style.backgroundColor)
        target.style.backgroundColor = "black";
      if (!document.body.style.backgroundColor)
        document.body.style.backgroundColor = "black";
      target.style.width = cssWidth + "px";
      target.style.height = cssHeight + "px";
      if (strategy.filteringMode == 1) {
        target.style.imageRendering = "optimizeSpeed";
        target.style.imageRendering = "-moz-crisp-edges";
        target.style.imageRendering = "-o-crisp-edges";
        target.style.imageRendering = "-webkit-optimize-contrast";
        target.style.imageRendering = "optimize-contrast";
        target.style.imageRendering = "crisp-edges";
        target.style.imageRendering = "pixelated";
      }
      var dpiScale = strategy.canvasResolutionScaleMode == 2 ? devicePixelRatio : 1;
      if (strategy.canvasResolutionScaleMode != 0) {
        var newWidth = cssWidth * dpiScale | 0;
        var newHeight = cssHeight * dpiScale | 0;
        setCanvasElementSize(target, newWidth, newHeight);
        if (target.GLctxObject)
          target.GLctxObject.GLctx.viewport(0, 0, newWidth, newHeight);
      }
      return restoreOldStyle;
    }
    function _JSEvents_requestFullscreen(target, strategy) {
      if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
        _JSEvents_resizeCanvasForFullscreen(target, strategy);
      }
      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else {
        return JSEvents.fullscreenEnabled() ? -3 : -1;
      }
      currentFullscreenStrategy = strategy;
      if (strategy.canvasResizedCallback) {
        wasmTable.get(strategy.canvasResizedCallback)(37, 0, strategy.canvasResizedCallbackUserData);
      }
      return 0;
    }
    function _emscripten_exit_fullscreen() {
      if (!JSEvents.fullscreenEnabled())
        return -1;
      JSEvents.removeDeferredCalls(_JSEvents_requestFullscreen);
      var d = specialHTMLTargets[1];
      if (d.exitFullscreen) {
        d.fullscreenElement && d.exitFullscreen();
      } else if (d.webkitExitFullscreen) {
        d.webkitFullscreenElement && d.webkitExitFullscreen();
      } else {
        return -1;
      }
      return 0;
    }
    function requestPointerLock(target) {
      if (target.requestPointerLock) {
        target.requestPointerLock();
      } else if (target.msRequestPointerLock) {
        target.msRequestPointerLock();
      } else {
        if (document.body.requestPointerLock || document.body.msRequestPointerLock) {
          return -3;
        } else {
          return -1;
        }
      }
      return 0;
    }
    function _emscripten_exit_pointerlock() {
      JSEvents.removeDeferredCalls(requestPointerLock);
      if (document.exitPointerLock) {
        document.exitPointerLock();
      } else if (document.msExitPointerLock) {
        document.msExitPointerLock();
      } else {
        return -1;
      }
      return 0;
    }
    function _emscripten_get_device_pixel_ratio() {
      return devicePixelRatio;
    }
    function _emscripten_get_element_css_size(target, width, height) {
      target = findEventTarget(target);
      if (!target)
        return -4;
      var rect = getBoundingClientRect(target);
      HEAPF64[width >> 3] = rect.width;
      HEAPF64[height >> 3] = rect.height;
      return 0;
    }
    function fillGamepadEventData(eventStruct, e) {
      HEAPF64[eventStruct >> 3] = e.timestamp;
      for (var i2 = 0; i2 < e.axes.length; ++i2) {
        HEAPF64[eventStruct + i2 * 8 + 16 >> 3] = e.axes[i2];
      }
      for (var i2 = 0; i2 < e.buttons.length; ++i2) {
        if (typeof e.buttons[i2] === "object") {
          HEAPF64[eventStruct + i2 * 8 + 528 >> 3] = e.buttons[i2].value;
        } else {
          HEAPF64[eventStruct + i2 * 8 + 528 >> 3] = e.buttons[i2];
        }
      }
      for (var i2 = 0; i2 < e.buttons.length; ++i2) {
        if (typeof e.buttons[i2] === "object") {
          HEAP32[eventStruct + i2 * 4 + 1040 >> 2] = e.buttons[i2].pressed;
        } else {
          HEAP32[eventStruct + i2 * 4 + 1040 >> 2] = e.buttons[i2] == 1;
        }
      }
      HEAP32[eventStruct + 1296 >> 2] = e.connected;
      HEAP32[eventStruct + 1300 >> 2] = e.index;
      HEAP32[eventStruct + 8 >> 2] = e.axes.length;
      HEAP32[eventStruct + 12 >> 2] = e.buttons.length;
      stringToUTF8(e.id, eventStruct + 1304, 64);
      stringToUTF8(e.mapping, eventStruct + 1368, 64);
    }
    function _emscripten_get_gamepad_status(index, gamepadState) {
      if (index < 0 || index >= JSEvents.lastGamepadState.length)
        return -5;
      if (!JSEvents.lastGamepadState[index])
        return -7;
      fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
      return 0;
    }
    function _emscripten_get_num_gamepads() {
      return JSEvents.lastGamepadState.length;
    }
    function _emscripten_glActiveTexture(x0) {
      GLctx["activeTexture"](x0);
    }
    function _emscripten_glAttachShader(program, shader) {
      GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
    }
    function _emscripten_glBeginQueryEXT(target, id) {
      GLctx.disjointTimerQueryExt["beginQueryEXT"](target, GL.timerQueriesEXT[id]);
    }
    function _emscripten_glBindAttribLocation(program, index, name) {
      GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
    }
    function _emscripten_glBindBuffer(target, buffer2) {
      GLctx.bindBuffer(target, GL.buffers[buffer2]);
    }
    function _emscripten_glBindFramebuffer(target, framebuffer) {
      GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
    }
    function _emscripten_glBindRenderbuffer(target, renderbuffer) {
      GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
    }
    function _emscripten_glBindTexture(target, texture) {
      GLctx.bindTexture(target, GL.textures[texture]);
    }
    function _emscripten_glBindVertexArrayOES(vao) {
      GLctx["bindVertexArray"](GL.vaos[vao]);
    }
    function _emscripten_glBlendColor(x0, x1, x2, x3) {
      GLctx["blendColor"](x0, x1, x2, x3);
    }
    function _emscripten_glBlendEquation(x0) {
      GLctx["blendEquation"](x0);
    }
    function _emscripten_glBlendEquationSeparate(x0, x1) {
      GLctx["blendEquationSeparate"](x0, x1);
    }
    function _emscripten_glBlendFunc(x0, x1) {
      GLctx["blendFunc"](x0, x1);
    }
    function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) {
      GLctx["blendFuncSeparate"](x0, x1, x2, x3);
    }
    function _emscripten_glBufferData(target, size, data, usage) {
      GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
    }
    function _emscripten_glBufferSubData(target, offset, size, data) {
      GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
    }
    function _emscripten_glCheckFramebufferStatus(x0) {
      return GLctx["checkFramebufferStatus"](x0);
    }
    function _emscripten_glClear(x0) {
      GLctx["clear"](x0);
    }
    function _emscripten_glClearColor(x0, x1, x2, x3) {
      GLctx["clearColor"](x0, x1, x2, x3);
    }
    function _emscripten_glClearDepthf(x0) {
      GLctx["clearDepth"](x0);
    }
    function _emscripten_glClearStencil(x0) {
      GLctx["clearStencil"](x0);
    }
    function _emscripten_glColorMask(red, green, blue, alpha) {
      GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
    }
    function _emscripten_glCompileShader(shader) {
      GLctx.compileShader(GL.shaders[shader]);
    }
    function _emscripten_glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
      GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null);
    }
    function _emscripten_glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
      GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, data ? HEAPU8.subarray(data, data + imageSize) : null);
    }
    function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
      GLctx["copyTexImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
    }
    function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
      GLctx["copyTexSubImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
    }
    function _emscripten_glCreateProgram() {
      var id = GL.getNewId(GL.programs);
      var program = GLctx.createProgram();
      program.name = id;
      GL.programs[id] = program;
      return id;
    }
    function _emscripten_glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = GLctx.createShader(shaderType);
      return id;
    }
    function _emscripten_glCullFace(x0) {
      GLctx["cullFace"](x0);
    }
    function _emscripten_glDeleteBuffers(n, buffers) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[buffers + i2 * 4 >> 2];
        var buffer2 = GL.buffers[id];
        if (!buffer2)
          continue;
        GLctx.deleteBuffer(buffer2);
        buffer2.name = 0;
        GL.buffers[id] = null;
      }
    }
    function _emscripten_glDeleteFramebuffers(n, framebuffers) {
      for (var i2 = 0; i2 < n; ++i2) {
        var id = HEAP32[framebuffers + i2 * 4 >> 2];
        var framebuffer = GL.framebuffers[id];
        if (!framebuffer)
          continue;
        GLctx.deleteFramebuffer(framebuffer);
        framebuffer.name = 0;
        GL.framebuffers[id] = null;
      }
    }
    function _emscripten_glDeleteProgram(id) {
      if (!id)
        return;
      var program = GL.programs[id];
      if (!program) {
        GL.recordError(1281);
        return;
      }
      GLctx.deleteProgram(program);
      program.name = 0;
      GL.programs[id] = null;
      GL.programInfos[id] = null;
    }
    function _emscripten_glDeleteQueriesEXT(n, ids) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[ids + i2 * 4 >> 2];
        var query = GL.timerQueriesEXT[id];
        if (!query)
          continue;
        GLctx.disjointTimerQueryExt["deleteQueryEXT"](query);
        GL.timerQueriesEXT[id] = null;
      }
    }
    function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[renderbuffers + i2 * 4 >> 2];
        var renderbuffer = GL.renderbuffers[id];
        if (!renderbuffer)
          continue;
        GLctx.deleteRenderbuffer(renderbuffer);
        renderbuffer.name = 0;
        GL.renderbuffers[id] = null;
      }
    }
    function _emscripten_glDeleteShader(id) {
      if (!id)
        return;
      var shader = GL.shaders[id];
      if (!shader) {
        GL.recordError(1281);
        return;
      }
      GLctx.deleteShader(shader);
      GL.shaders[id] = null;
    }
    function _emscripten_glDeleteTextures(n, textures) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[textures + i2 * 4 >> 2];
        var texture = GL.textures[id];
        if (!texture)
          continue;
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
      }
    }
    function _emscripten_glDeleteVertexArraysOES(n, vaos) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[vaos + i2 * 4 >> 2];
        GLctx["deleteVertexArray"](GL.vaos[id]);
        GL.vaos[id] = null;
      }
    }
    function _emscripten_glDepthFunc(x0) {
      GLctx["depthFunc"](x0);
    }
    function _emscripten_glDepthMask(flag) {
      GLctx.depthMask(!!flag);
    }
    function _emscripten_glDepthRangef(x0, x1) {
      GLctx["depthRange"](x0, x1);
    }
    function _emscripten_glDetachShader(program, shader) {
      GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
    }
    function _emscripten_glDisable(x0) {
      GLctx["disable"](x0);
    }
    function _emscripten_glDisableVertexAttribArray(index) {
      GLctx.disableVertexAttribArray(index);
    }
    function _emscripten_glDrawArrays(mode, first, count) {
      GLctx.drawArrays(mode, first, count);
    }
    function _emscripten_glDrawArraysInstancedANGLE(mode, first, count, primcount) {
      GLctx["drawArraysInstanced"](mode, first, count, primcount);
    }
    var tempFixedLengthArray = [];
    function _emscripten_glDrawBuffersWEBGL(n, bufs) {
      var bufArray = tempFixedLengthArray[n];
      for (var i2 = 0; i2 < n; i2++) {
        bufArray[i2] = HEAP32[bufs + i2 * 4 >> 2];
      }
      GLctx["drawBuffers"](bufArray);
    }
    function _emscripten_glDrawElements(mode, count, type, indices) {
      GLctx.drawElements(mode, count, type, indices);
    }
    function _emscripten_glDrawElementsInstancedANGLE(mode, count, type, indices, primcount) {
      GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
    }
    function _emscripten_glEnable(x0) {
      GLctx["enable"](x0);
    }
    function _emscripten_glEnableVertexAttribArray(index) {
      GLctx.enableVertexAttribArray(index);
    }
    function _emscripten_glEndQueryEXT(target) {
      GLctx.disjointTimerQueryExt["endQueryEXT"](target);
    }
    function _emscripten_glFinish() {
      GLctx["finish"]();
    }
    function _emscripten_glFlush() {
      GLctx["flush"]();
    }
    function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
      GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
    }
    function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
      GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
    }
    function _emscripten_glFrontFace(x0) {
      GLctx["frontFace"](x0);
    }
    function __glGenObject(n, buffers, createFunction, objectTable) {
      for (var i2 = 0; i2 < n; i2++) {
        var buffer2 = GLctx[createFunction]();
        var id = buffer2 && GL.getNewId(objectTable);
        if (buffer2) {
          buffer2.name = id;
          objectTable[id] = buffer2;
        } else {
          GL.recordError(1282);
        }
        HEAP32[buffers + i2 * 4 >> 2] = id;
      }
    }
    function _emscripten_glGenBuffers(n, buffers) {
      __glGenObject(n, buffers, "createBuffer", GL.buffers);
    }
    function _emscripten_glGenFramebuffers(n, ids) {
      __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
    }
    function _emscripten_glGenQueriesEXT(n, ids) {
      for (var i2 = 0; i2 < n; i2++) {
        var query = GLctx.disjointTimerQueryExt["createQueryEXT"]();
        if (!query) {
          GL.recordError(1282);
          while (i2 < n)
            HEAP32[ids + i2++ * 4 >> 2] = 0;
          return;
        }
        var id = GL.getNewId(GL.timerQueriesEXT);
        query.name = id;
        GL.timerQueriesEXT[id] = query;
        HEAP32[ids + i2 * 4 >> 2] = id;
      }
    }
    function _emscripten_glGenRenderbuffers(n, renderbuffers) {
      __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
    }
    function _emscripten_glGenTextures(n, textures) {
      __glGenObject(n, textures, "createTexture", GL.textures);
    }
    function _emscripten_glGenVertexArraysOES(n, arrays) {
      __glGenObject(n, arrays, "createVertexArray", GL.vaos);
    }
    function _emscripten_glGenerateMipmap(x0) {
      GLctx["generateMipmap"](x0);
    }
    function __glGetActiveAttribOrUniform(funcName, program, index, bufSize, length, size, type, name) {
      program = GL.programs[program];
      var info = GLctx[funcName](program, index);
      if (info) {
        var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize);
        if (length)
          HEAP32[length >> 2] = numBytesWrittenExclNull;
        if (size)
          HEAP32[size >> 2] = info.size;
        if (type)
          HEAP32[type >> 2] = info.type;
      }
    }
    function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
      __glGetActiveAttribOrUniform("getActiveAttrib", program, index, bufSize, length, size, type, name);
    }
    function _emscripten_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
      __glGetActiveAttribOrUniform("getActiveUniform", program, index, bufSize, length, size, type, name);
    }
    function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
      var result = GLctx.getAttachedShaders(GL.programs[program]);
      var len = result.length;
      if (len > maxCount) {
        len = maxCount;
      }
      HEAP32[count >> 2] = len;
      for (var i2 = 0; i2 < len; ++i2) {
        var id = GL.shaders.indexOf(result[i2]);
        HEAP32[shaders + i2 * 4 >> 2] = id;
      }
    }
    function _emscripten_glGetAttribLocation(program, name) {
      return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
    }
    function writeI53ToI64(ptr, num) {
      HEAPU32[ptr >> 2] = num;
      HEAPU32[ptr + 4 >> 2] = (num - HEAPU32[ptr >> 2]) / 4294967296;
    }
    function emscriptenWebGLGet(name_, p, type) {
      if (!p) {
        GL.recordError(1281);
        return;
      }
      var ret = void 0;
      switch (name_) {
        case 36346:
          ret = 1;
          break;
        case 36344:
          if (type != 0 && type != 1) {
            GL.recordError(1280);
          }
          return;
        case 36345:
          ret = 0;
          break;
        case 34466:
          var formats = GLctx.getParameter(34467);
          ret = formats ? formats.length : 0;
          break;
      }
      if (ret === void 0) {
        var result = GLctx.getParameter(name_);
        switch (typeof result) {
          case "number":
            ret = result;
            break;
          case "boolean":
            ret = result ? 1 : 0;
            break;
          case "string":
            GL.recordError(1280);
            return;
          case "object":
            if (result === null) {
              switch (name_) {
                case 34964:
                case 35725:
                case 34965:
                case 36006:
                case 36007:
                case 32873:
                case 34229:
                case 34068: {
                  ret = 0;
                  break;
                }
                default: {
                  GL.recordError(1280);
                  return;
                }
              }
            } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
              for (var i2 = 0; i2 < result.length; ++i2) {
                switch (type) {
                  case 0:
                    HEAP32[p + i2 * 4 >> 2] = result[i2];
                    break;
                  case 2:
                    HEAPF32[p + i2 * 4 >> 2] = result[i2];
                    break;
                  case 4:
                    HEAP8[p + i2 >> 0] = result[i2] ? 1 : 0;
                    break;
                }
              }
              return;
            } else {
              try {
                ret = result.name | 0;
              } catch (e) {
                GL.recordError(1280);
                err("GL_INVALID_ENUM in glGet" + type + "v: Unknown object returned from WebGL getParameter(" + name_ + ")! (error: " + e + ")");
                return;
              }
            }
            break;
          default:
            GL.recordError(1280);
            err("GL_INVALID_ENUM in glGet" + type + "v: Native code calling glGet" + type + "v(" + name_ + ") and it returns " + result + " of type " + typeof result + "!");
            return;
        }
      }
      switch (type) {
        case 1:
          writeI53ToI64(p, ret);
          break;
        case 0:
          HEAP32[p >> 2] = ret;
          break;
        case 2:
          HEAPF32[p >> 2] = ret;
          break;
        case 4:
          HEAP8[p >> 0] = ret ? 1 : 0;
          break;
      }
    }
    function _emscripten_glGetBooleanv(name_, p) {
      emscriptenWebGLGet(name_, p, 4);
    }
    function _emscripten_glGetBufferParameteriv(target, value, data) {
      if (!data) {
        GL.recordError(1281);
        return;
      }
      HEAP32[data >> 2] = GLctx.getBufferParameter(target, value);
    }
    function _emscripten_glGetError() {
      var error = GLctx.getError() || GL.lastError;
      GL.lastError = 0;
      return error;
    }
    function _emscripten_glGetFloatv(name_, p) {
      emscriptenWebGLGet(name_, p, 2);
    }
    function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
      var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
      if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
        result = result.name | 0;
      }
      HEAP32[params >> 2] = result;
    }
    function _emscripten_glGetIntegerv(name_, p) {
      emscriptenWebGLGet(name_, p, 0);
    }
    function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
      var log = GLctx.getProgramInfoLog(GL.programs[program]);
      if (log === null)
        log = "(unknown error)";
      var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
      if (length)
        HEAP32[length >> 2] = numBytesWrittenExclNull;
    }
    function _emscripten_glGetProgramiv(program, pname, p) {
      if (!p) {
        GL.recordError(1281);
        return;
      }
      if (program >= GL.counter) {
        GL.recordError(1281);
        return;
      }
      var ptable = GL.programInfos[program];
      if (!ptable) {
        GL.recordError(1282);
        return;
      }
      if (pname == 35716) {
        var log = GLctx.getProgramInfoLog(GL.programs[program]);
        if (log === null)
          log = "(unknown error)";
        HEAP32[p >> 2] = log.length + 1;
      } else if (pname == 35719) {
        HEAP32[p >> 2] = ptable.maxUniformLength;
      } else if (pname == 35722) {
        if (ptable.maxAttributeLength == -1) {
          program = GL.programs[program];
          var numAttribs = GLctx.getProgramParameter(program, 35721);
          ptable.maxAttributeLength = 0;
          for (var i2 = 0; i2 < numAttribs; ++i2) {
            var activeAttrib = GLctx.getActiveAttrib(program, i2);
            ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1);
          }
        }
        HEAP32[p >> 2] = ptable.maxAttributeLength;
      } else if (pname == 35381) {
        if (ptable.maxUniformBlockNameLength == -1) {
          program = GL.programs[program];
          var numBlocks = GLctx.getProgramParameter(program, 35382);
          ptable.maxUniformBlockNameLength = 0;
          for (var i2 = 0; i2 < numBlocks; ++i2) {
            var activeBlockName = GLctx.getActiveUniformBlockName(program, i2);
            ptable.maxUniformBlockNameLength = Math.max(ptable.maxUniformBlockNameLength, activeBlockName.length + 1);
          }
        }
        HEAP32[p >> 2] = ptable.maxUniformBlockNameLength;
      } else {
        HEAP32[p >> 2] = GLctx.getProgramParameter(GL.programs[program], pname);
      }
    }
    function _emscripten_glGetQueryObjecti64vEXT(id, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      var query = GL.timerQueriesEXT[id];
      var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
      var ret;
      if (typeof param == "boolean") {
        ret = param ? 1 : 0;
      } else {
        ret = param;
      }
      writeI53ToI64(params, ret);
    }
    function _emscripten_glGetQueryObjectivEXT(id, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      var query = GL.timerQueriesEXT[id];
      var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
      var ret;
      if (typeof param == "boolean") {
        ret = param ? 1 : 0;
      } else {
        ret = param;
      }
      HEAP32[params >> 2] = ret;
    }
    function _emscripten_glGetQueryObjectui64vEXT(id, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      var query = GL.timerQueriesEXT[id];
      var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
      var ret;
      if (typeof param == "boolean") {
        ret = param ? 1 : 0;
      } else {
        ret = param;
      }
      writeI53ToI64(params, ret);
    }
    function _emscripten_glGetQueryObjectuivEXT(id, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      var query = GL.timerQueriesEXT[id];
      var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
      var ret;
      if (typeof param == "boolean") {
        ret = param ? 1 : 0;
      } else {
        ret = param;
      }
      HEAP32[params >> 2] = ret;
    }
    function _emscripten_glGetQueryivEXT(target, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      HEAP32[params >> 2] = GLctx.disjointTimerQueryExt["getQueryEXT"](target, pname);
    }
    function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname);
    }
    function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
      var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
      if (log === null)
        log = "(unknown error)";
      var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
      if (length)
        HEAP32[length >> 2] = numBytesWrittenExclNull;
    }
    function _emscripten_glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
      var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
      HEAP32[range >> 2] = result.rangeMin;
      HEAP32[range + 4 >> 2] = result.rangeMax;
      HEAP32[precision >> 2] = result.precision;
    }
    function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
      var result = GLctx.getShaderSource(GL.shaders[shader]);
      if (!result)
        return;
      var numBytesWrittenExclNull = bufSize > 0 && source ? stringToUTF8(result, source, bufSize) : 0;
      if (length)
        HEAP32[length >> 2] = numBytesWrittenExclNull;
    }
    function _emscripten_glGetShaderiv(shader, pname, p) {
      if (!p) {
        GL.recordError(1281);
        return;
      }
      if (pname == 35716) {
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null)
          log = "(unknown error)";
        var logLength = log ? log.length + 1 : 0;
        HEAP32[p >> 2] = logLength;
      } else if (pname == 35720) {
        var source = GLctx.getShaderSource(GL.shaders[shader]);
        var sourceLength = source ? source.length + 1 : 0;
        HEAP32[p >> 2] = sourceLength;
      } else {
        HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
      }
    }
    function stringToNewUTF8(jsString) {
      var length = lengthBytesUTF8(jsString) + 1;
      var cString = _malloc(length);
      stringToUTF8(jsString, cString, length);
      return cString;
    }
    function _emscripten_glGetString(name_) {
      if (GL.stringCache[name_])
        return GL.stringCache[name_];
      var ret;
      switch (name_) {
        case 7939:
          var exts = GLctx.getSupportedExtensions() || [];
          exts = exts.concat(exts.map(function(e) {
            return "GL_" + e;
          }));
          ret = stringToNewUTF8(exts.join(" "));
          break;
        case 7936:
        case 7937:
        case 37445:
        case 37446:
          var s = GLctx.getParameter(name_);
          if (!s) {
            GL.recordError(1280);
          }
          ret = stringToNewUTF8(s);
          break;
        case 7938:
          var glVersion = GLctx.getParameter(7938);
          {
            glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
          }
          ret = stringToNewUTF8(glVersion);
          break;
        case 35724:
          var glslVersion = GLctx.getParameter(35724);
          var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
          var ver_num = glslVersion.match(ver_re);
          if (ver_num !== null) {
            if (ver_num[1].length == 3)
              ver_num[1] = ver_num[1] + "0";
            glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
          }
          ret = stringToNewUTF8(glslVersion);
          break;
        default:
          GL.recordError(1280);
          return 0;
      }
      GL.stringCache[name_] = ret;
      return ret;
    }
    function _emscripten_glGetTexParameterfv(target, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname);
    }
    function _emscripten_glGetTexParameteriv(target, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      HEAP32[params >> 2] = GLctx.getTexParameter(target, pname);
    }
    function jstoi_q(str) {
      return parseInt(str);
    }
    function _emscripten_glGetUniformLocation(program, name) {
      name = UTF8ToString(name);
      var arrayIndex = 0;
      if (name[name.length - 1] == "]") {
        var leftBrace = name.lastIndexOf("[");
        arrayIndex = name[leftBrace + 1] != "]" ? jstoi_q(name.slice(leftBrace + 1)) : 0;
        name = name.slice(0, leftBrace);
      }
      var uniformInfo = GL.programInfos[program] && GL.programInfos[program].uniforms[name];
      if (uniformInfo && arrayIndex >= 0 && arrayIndex < uniformInfo[0]) {
        return uniformInfo[1] + arrayIndex;
      } else {
        return -1;
      }
    }
    function emscriptenWebGLGetUniform(program, location, params, type) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      var data = GLctx.getUniform(GL.programs[program], GL.uniforms[location]);
      if (typeof data == "number" || typeof data == "boolean") {
        switch (type) {
          case 0:
            HEAP32[params >> 2] = data;
            break;
          case 2:
            HEAPF32[params >> 2] = data;
            break;
        }
      } else {
        for (var i2 = 0; i2 < data.length; i2++) {
          switch (type) {
            case 0:
              HEAP32[params + i2 * 4 >> 2] = data[i2];
              break;
            case 2:
              HEAPF32[params + i2 * 4 >> 2] = data[i2];
              break;
          }
        }
      }
    }
    function _emscripten_glGetUniformfv(program, location, params) {
      emscriptenWebGLGetUniform(program, location, params, 2);
    }
    function _emscripten_glGetUniformiv(program, location, params) {
      emscriptenWebGLGetUniform(program, location, params, 0);
    }
    function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
      if (!pointer) {
        GL.recordError(1281);
        return;
      }
      HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname);
    }
    function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      var data = GLctx.getVertexAttrib(index, pname);
      if (pname == 34975) {
        HEAP32[params >> 2] = data && data["name"];
      } else if (typeof data == "number" || typeof data == "boolean") {
        switch (type) {
          case 0:
            HEAP32[params >> 2] = data;
            break;
          case 2:
            HEAPF32[params >> 2] = data;
            break;
          case 5:
            HEAP32[params >> 2] = Math.fround(data);
            break;
        }
      } else {
        for (var i2 = 0; i2 < data.length; i2++) {
          switch (type) {
            case 0:
              HEAP32[params + i2 * 4 >> 2] = data[i2];
              break;
            case 2:
              HEAPF32[params + i2 * 4 >> 2] = data[i2];
              break;
            case 5:
              HEAP32[params + i2 * 4 >> 2] = Math.fround(data[i2]);
              break;
          }
        }
      }
    }
    function _emscripten_glGetVertexAttribfv(index, pname, params) {
      emscriptenWebGLGetVertexAttrib(index, pname, params, 2);
    }
    function _emscripten_glGetVertexAttribiv(index, pname, params) {
      emscriptenWebGLGetVertexAttrib(index, pname, params, 5);
    }
    function _emscripten_glHint(x0, x1) {
      GLctx["hint"](x0, x1);
    }
    function _emscripten_glIsBuffer(buffer2) {
      var b = GL.buffers[buffer2];
      if (!b)
        return 0;
      return GLctx.isBuffer(b);
    }
    function _emscripten_glIsEnabled(x0) {
      return GLctx["isEnabled"](x0);
    }
    function _emscripten_glIsFramebuffer(framebuffer) {
      var fb = GL.framebuffers[framebuffer];
      if (!fb)
        return 0;
      return GLctx.isFramebuffer(fb);
    }
    function _emscripten_glIsProgram(program) {
      program = GL.programs[program];
      if (!program)
        return 0;
      return GLctx.isProgram(program);
    }
    function _emscripten_glIsQueryEXT(id) {
      var query = GL.timerQueriesEXT[id];
      if (!query)
        return 0;
      return GLctx.disjointTimerQueryExt["isQueryEXT"](query);
    }
    function _emscripten_glIsRenderbuffer(renderbuffer) {
      var rb = GL.renderbuffers[renderbuffer];
      if (!rb)
        return 0;
      return GLctx.isRenderbuffer(rb);
    }
    function _emscripten_glIsShader(shader) {
      var s = GL.shaders[shader];
      if (!s)
        return 0;
      return GLctx.isShader(s);
    }
    function _emscripten_glIsTexture(id) {
      var texture = GL.textures[id];
      if (!texture)
        return 0;
      return GLctx.isTexture(texture);
    }
    function _emscripten_glIsVertexArrayOES(array) {
      var vao = GL.vaos[array];
      if (!vao)
        return 0;
      return GLctx["isVertexArray"](vao);
    }
    function _emscripten_glLineWidth(x0) {
      GLctx["lineWidth"](x0);
    }
    function _emscripten_glLinkProgram(program) {
      GLctx.linkProgram(GL.programs[program]);
      GL.populateUniformTable(program);
    }
    function _emscripten_glPixelStorei(pname, param) {
      if (pname == 3317) {
        GL.unpackAlignment = param;
      }
      GLctx.pixelStorei(pname, param);
    }
    function _emscripten_glPolygonOffset(x0, x1) {
      GLctx["polygonOffset"](x0, x1);
    }
    function _emscripten_glQueryCounterEXT(id, target) {
      GLctx.disjointTimerQueryExt["queryCounterEXT"](GL.timerQueriesEXT[id], target);
    }
    function computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
      function roundedToNextMultipleOf(x, y) {
        return x + y - 1 & -y;
      }
      var plainRowSize = width * sizePerPixel;
      var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
      return height * alignedRowSize;
    }
    function __colorChannelsInGlTextureFormat(format) {
      var colorChannels = {5: 3, 6: 4, 8: 2, 29502: 3, 29504: 4};
      return colorChannels[format - 6402] || 1;
    }
    function heapObjectForWebGLType(type) {
      type -= 5120;
      if (type == 1)
        return HEAPU8;
      if (type == 4)
        return HEAP32;
      if (type == 6)
        return HEAPF32;
      if (type == 5 || type == 28922)
        return HEAPU32;
      return HEAPU16;
    }
    function heapAccessShiftForWebGLHeap(heap) {
      return 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
    }
    function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
      var heap = heapObjectForWebGLType(type);
      var shift = heapAccessShiftForWebGLHeap(heap);
      var byteSize = 1 << shift;
      var sizePerPixel = __colorChannelsInGlTextureFormat(format) * byteSize;
      var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
      return heap.subarray(pixels >> shift, pixels + bytes >> shift);
    }
    function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
      var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels);
      if (!pixelData) {
        GL.recordError(1280);
        return;
      }
      GLctx.readPixels(x, y, width, height, format, type, pixelData);
    }
    function _emscripten_glReleaseShaderCompiler() {
    }
    function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) {
      GLctx["renderbufferStorage"](x0, x1, x2, x3);
    }
    function _emscripten_glSampleCoverage(value, invert) {
      GLctx.sampleCoverage(value, !!invert);
    }
    function _emscripten_glScissor(x0, x1, x2, x3) {
      GLctx["scissor"](x0, x1, x2, x3);
    }
    function _emscripten_glShaderBinary() {
      GL.recordError(1280);
    }
    function _emscripten_glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      GLctx.shaderSource(GL.shaders[shader], source);
    }
    function _emscripten_glStencilFunc(x0, x1, x2) {
      GLctx["stencilFunc"](x0, x1, x2);
    }
    function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) {
      GLctx["stencilFuncSeparate"](x0, x1, x2, x3);
    }
    function _emscripten_glStencilMask(x0) {
      GLctx["stencilMask"](x0);
    }
    function _emscripten_glStencilMaskSeparate(x0, x1) {
      GLctx["stencilMaskSeparate"](x0, x1);
    }
    function _emscripten_glStencilOp(x0, x1, x2) {
      GLctx["stencilOp"](x0, x1, x2);
    }
    function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) {
      GLctx["stencilOpSeparate"](x0, x1, x2, x3);
    }
    function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels) : null);
    }
    function _emscripten_glTexParameterf(x0, x1, x2) {
      GLctx["texParameterf"](x0, x1, x2);
    }
    function _emscripten_glTexParameterfv(target, pname, params) {
      var param = HEAPF32[params >> 2];
      GLctx.texParameterf(target, pname, param);
    }
    function _emscripten_glTexParameteri(x0, x1, x2) {
      GLctx["texParameteri"](x0, x1, x2);
    }
    function _emscripten_glTexParameteriv(target, pname, params) {
      var param = HEAP32[params >> 2];
      GLctx.texParameteri(target, pname, param);
    }
    function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
      var pixelData = null;
      if (pixels)
        pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels);
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
    }
    function _emscripten_glUniform1f(location, v0) {
      GLctx.uniform1f(GL.uniforms[location], v0);
    }
    var miniTempWebGLFloatBuffers = [];
    function _emscripten_glUniform1fv(location, count, value) {
      if (count <= 288) {
        var view = miniTempWebGLFloatBuffers[count - 1];
        for (var i2 = 0; i2 < count; ++i2) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2);
      }
      GLctx.uniform1fv(GL.uniforms[location], view);
    }
    function _emscripten_glUniform1i(location, v0) {
      GLctx.uniform1i(GL.uniforms[location], v0);
    }
    var __miniTempWebGLIntBuffers = [];
    function _emscripten_glUniform1iv(location, count, value) {
      if (count <= 288) {
        var view = __miniTempWebGLIntBuffers[count - 1];
        for (var i2 = 0; i2 < count; ++i2) {
          view[i2] = HEAP32[value + 4 * i2 >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, value + count * 4 >> 2);
      }
      GLctx.uniform1iv(GL.uniforms[location], view);
    }
    function _emscripten_glUniform2f(location, v0, v1) {
      GLctx.uniform2f(GL.uniforms[location], v0, v1);
    }
    function _emscripten_glUniform2fv(location, count, value) {
      if (count <= 144) {
        var view = miniTempWebGLFloatBuffers[2 * count - 1];
        for (var i2 = 0; i2 < 2 * count; i2 += 2) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2);
      }
      GLctx.uniform2fv(GL.uniforms[location], view);
    }
    function _emscripten_glUniform2i(location, v0, v1) {
      GLctx.uniform2i(GL.uniforms[location], v0, v1);
    }
    function _emscripten_glUniform2iv(location, count, value) {
      if (count <= 144) {
        var view = __miniTempWebGLIntBuffers[2 * count - 1];
        for (var i2 = 0; i2 < 2 * count; i2 += 2) {
          view[i2] = HEAP32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAP32[value + (4 * i2 + 4) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, value + count * 8 >> 2);
      }
      GLctx.uniform2iv(GL.uniforms[location], view);
    }
    function _emscripten_glUniform3f(location, v0, v1, v2) {
      GLctx.uniform3f(GL.uniforms[location], v0, v1, v2);
    }
    function _emscripten_glUniform3fv(location, count, value) {
      if (count <= 96) {
        var view = miniTempWebGLFloatBuffers[3 * count - 1];
        for (var i2 = 0; i2 < 3 * count; i2 += 3) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAPF32[value + (4 * i2 + 8) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2);
      }
      GLctx.uniform3fv(GL.uniforms[location], view);
    }
    function _emscripten_glUniform3i(location, v0, v1, v2) {
      GLctx.uniform3i(GL.uniforms[location], v0, v1, v2);
    }
    function _emscripten_glUniform3iv(location, count, value) {
      if (count <= 96) {
        var view = __miniTempWebGLIntBuffers[3 * count - 1];
        for (var i2 = 0; i2 < 3 * count; i2 += 3) {
          view[i2] = HEAP32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAP32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAP32[value + (4 * i2 + 8) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, value + count * 12 >> 2);
      }
      GLctx.uniform3iv(GL.uniforms[location], view);
    }
    function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
      GLctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3);
    }
    function _emscripten_glUniform4fv(location, count, value) {
      if (count <= 72) {
        var view = miniTempWebGLFloatBuffers[4 * count - 1];
        var heap = HEAPF32;
        value >>= 2;
        for (var i2 = 0; i2 < 4 * count; i2 += 4) {
          var dst = value + i2;
          view[i2] = heap[dst];
          view[i2 + 1] = heap[dst + 1];
          view[i2 + 2] = heap[dst + 2];
          view[i2 + 3] = heap[dst + 3];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
      }
      GLctx.uniform4fv(GL.uniforms[location], view);
    }
    function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
      GLctx.uniform4i(GL.uniforms[location], v0, v1, v2, v3);
    }
    function _emscripten_glUniform4iv(location, count, value) {
      if (count <= 72) {
        var view = __miniTempWebGLIntBuffers[4 * count - 1];
        for (var i2 = 0; i2 < 4 * count; i2 += 4) {
          view[i2] = HEAP32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAP32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAP32[value + (4 * i2 + 8) >> 2];
          view[i2 + 3] = HEAP32[value + (4 * i2 + 12) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, value + count * 16 >> 2);
      }
      GLctx.uniform4iv(GL.uniforms[location], view);
    }
    function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
      if (count <= 72) {
        var view = miniTempWebGLFloatBuffers[4 * count - 1];
        for (var i2 = 0; i2 < 4 * count; i2 += 4) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAPF32[value + (4 * i2 + 8) >> 2];
          view[i2 + 3] = HEAPF32[value + (4 * i2 + 12) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
      }
      GLctx.uniformMatrix2fv(GL.uniforms[location], !!transpose, view);
    }
    function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
      if (count <= 32) {
        var view = miniTempWebGLFloatBuffers[9 * count - 1];
        for (var i2 = 0; i2 < 9 * count; i2 += 9) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAPF32[value + (4 * i2 + 8) >> 2];
          view[i2 + 3] = HEAPF32[value + (4 * i2 + 12) >> 2];
          view[i2 + 4] = HEAPF32[value + (4 * i2 + 16) >> 2];
          view[i2 + 5] = HEAPF32[value + (4 * i2 + 20) >> 2];
          view[i2 + 6] = HEAPF32[value + (4 * i2 + 24) >> 2];
          view[i2 + 7] = HEAPF32[value + (4 * i2 + 28) >> 2];
          view[i2 + 8] = HEAPF32[value + (4 * i2 + 32) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2);
      }
      GLctx.uniformMatrix3fv(GL.uniforms[location], !!transpose, view);
    }
    function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
      if (count <= 18) {
        var view = miniTempWebGLFloatBuffers[16 * count - 1];
        var heap = HEAPF32;
        value >>= 2;
        for (var i2 = 0; i2 < 16 * count; i2 += 16) {
          var dst = value + i2;
          view[i2] = heap[dst];
          view[i2 + 1] = heap[dst + 1];
          view[i2 + 2] = heap[dst + 2];
          view[i2 + 3] = heap[dst + 3];
          view[i2 + 4] = heap[dst + 4];
          view[i2 + 5] = heap[dst + 5];
          view[i2 + 6] = heap[dst + 6];
          view[i2 + 7] = heap[dst + 7];
          view[i2 + 8] = heap[dst + 8];
          view[i2 + 9] = heap[dst + 9];
          view[i2 + 10] = heap[dst + 10];
          view[i2 + 11] = heap[dst + 11];
          view[i2 + 12] = heap[dst + 12];
          view[i2 + 13] = heap[dst + 13];
          view[i2 + 14] = heap[dst + 14];
          view[i2 + 15] = heap[dst + 15];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2);
      }
      GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, view);
    }
    function _emscripten_glUseProgram(program) {
      GLctx.useProgram(GL.programs[program]);
    }
    function _emscripten_glValidateProgram(program) {
      GLctx.validateProgram(GL.programs[program]);
    }
    function _emscripten_glVertexAttrib1f(x0, x1) {
      GLctx["vertexAttrib1f"](x0, x1);
    }
    function _emscripten_glVertexAttrib1fv(index, v) {
      GLctx.vertexAttrib1f(index, HEAPF32[v >> 2]);
    }
    function _emscripten_glVertexAttrib2f(x0, x1, x2) {
      GLctx["vertexAttrib2f"](x0, x1, x2);
    }
    function _emscripten_glVertexAttrib2fv(index, v) {
      GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]);
    }
    function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) {
      GLctx["vertexAttrib3f"](x0, x1, x2, x3);
    }
    function _emscripten_glVertexAttrib3fv(index, v) {
      GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2]);
    }
    function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) {
      GLctx["vertexAttrib4f"](x0, x1, x2, x3, x4);
    }
    function _emscripten_glVertexAttrib4fv(index, v) {
      GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2]);
    }
    function _emscripten_glVertexAttribDivisorANGLE(index, divisor) {
      GLctx["vertexAttribDivisor"](index, divisor);
    }
    function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
    }
    function _emscripten_glViewport(x0, x1, x2, x3) {
      GLctx["viewport"](x0, x1, x2, x3);
    }
    function _emscripten_has_asyncify() {
      return 0;
    }
    function _longjmp(env, value) {
      _setThrew(env, value || 1);
      throw "longjmp";
    }
    function _emscripten_longjmp(a0, a1) {
      return _longjmp(a0, a1);
    }
    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }
    function doRequestFullscreen(target, strategy) {
      if (!JSEvents.fullscreenEnabled())
        return -1;
      target = findEventTarget(target);
      if (!target)
        return -4;
      if (!target.requestFullscreen && !target.webkitRequestFullscreen) {
        return -3;
      }
      var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
      if (!canPerformRequests) {
        if (strategy.deferUntilInEventHandler) {
          JSEvents.deferCall(_JSEvents_requestFullscreen, 1, [target, strategy]);
          return 1;
        } else {
          return -2;
        }
      }
      return _JSEvents_requestFullscreen(target, strategy);
    }
    function _emscripten_request_fullscreen_strategy(target, deferUntilInEventHandler, fullscreenStrategy) {
      var strategy = {scaleMode: HEAP32[fullscreenStrategy >> 2], canvasResolutionScaleMode: HEAP32[fullscreenStrategy + 4 >> 2], filteringMode: HEAP32[fullscreenStrategy + 8 >> 2], deferUntilInEventHandler, canvasResizedCallback: HEAP32[fullscreenStrategy + 12 >> 2], canvasResizedCallbackUserData: HEAP32[fullscreenStrategy + 16 >> 2]};
      return doRequestFullscreen(target, strategy);
    }
    function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
      target = findEventTarget(target);
      if (!target)
        return -4;
      if (!target.requestPointerLock && !target.msRequestPointerLock) {
        return -1;
      }
      var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
      if (!canPerformRequests) {
        if (deferUntilInEventHandler) {
          JSEvents.deferCall(requestPointerLock, 2, [target]);
          return 1;
        } else {
          return -2;
        }
      }
      return requestPointerLock(target);
    }
    function abortOnCannotGrowMemory(requestedSize) {
      abort("OOM");
    }
    function _emscripten_resize_heap(requestedSize) {
      abortOnCannotGrowMemory();
    }
    function _emscripten_sample_gamepad_data() {
      return (JSEvents.lastGamepadState = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : null) ? 0 : -1;
    }
    function registerBeforeUnloadEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
      var beforeUnloadEventHandlerFunc = function(ev) {
        var e = ev || event;
        var confirmationMessage = wasmTable.get(callbackfunc)(eventTypeId, 0, userData);
        if (confirmationMessage) {
          confirmationMessage = UTF8ToString(confirmationMessage);
        }
        if (confirmationMessage) {
          e.preventDefault();
          e.returnValue = confirmationMessage;
          return confirmationMessage;
        }
      };
      var eventHandler = {target: findEventTarget(target), eventTypeString, callbackfunc, handlerFunc: beforeUnloadEventHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_beforeunload_callback_on_thread(userData, callbackfunc, targetThread) {
      if (typeof onbeforeunload === "undefined")
        return -1;
      if (targetThread !== 1)
        return -5;
      registerBeforeUnloadEventCallback(2, userData, true, callbackfunc, 28, "beforeunload");
      return 0;
    }
    function registerFocusEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.focusEvent)
        JSEvents.focusEvent = _malloc(256);
      var focusEventHandlerFunc = function(ev) {
        var e = ev || event;
        var nodeName = JSEvents.getNodeNameForTarget(e.target);
        var id = e.target.id ? e.target.id : "";
        var focusEvent = JSEvents.focusEvent;
        stringToUTF8(nodeName, focusEvent + 0, 128);
        stringToUTF8(id, focusEvent + 128, 128);
        if (wasmTable.get(callbackfunc)(eventTypeId, focusEvent, userData))
          e.preventDefault();
      };
      var eventHandler = {target: findEventTarget(target), eventTypeString, callbackfunc, handlerFunc: focusEventHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_blur_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerFocusEventCallback(target, userData, useCapture, callbackfunc, 12, "blur");
      return 0;
    }
    function _emscripten_set_element_css_size(target, width, height) {
      target = findEventTarget(target);
      if (!target)
        return -4;
      target.style.width = width + "px";
      target.style.height = height + "px";
      return 0;
    }
    function _emscripten_set_focus_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerFocusEventCallback(target, userData, useCapture, callbackfunc, 13, "focus");
      return 0;
    }
    function fillFullscreenChangeEventData(eventStruct) {
      var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      var isFullscreen = !!fullscreenElement;
      HEAP32[eventStruct >> 2] = isFullscreen;
      HEAP32[eventStruct + 4 >> 2] = JSEvents.fullscreenEnabled();
      var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
      var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
      var id = reportedElement && reportedElement.id ? reportedElement.id : "";
      stringToUTF8(nodeName, eventStruct + 8, 128);
      stringToUTF8(id, eventStruct + 136, 128);
      HEAP32[eventStruct + 264 >> 2] = reportedElement ? reportedElement.clientWidth : 0;
      HEAP32[eventStruct + 268 >> 2] = reportedElement ? reportedElement.clientHeight : 0;
      HEAP32[eventStruct + 272 >> 2] = screen.width;
      HEAP32[eventStruct + 276 >> 2] = screen.height;
      if (isFullscreen) {
        JSEvents.previousFullscreenElement = fullscreenElement;
      }
    }
    function registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.fullscreenChangeEvent)
        JSEvents.fullscreenChangeEvent = _malloc(280);
      var fullscreenChangeEventhandlerFunc = function(ev) {
        var e = ev || event;
        var fullscreenChangeEvent = JSEvents.fullscreenChangeEvent;
        fillFullscreenChangeEventData(fullscreenChangeEvent);
        if (wasmTable.get(callbackfunc)(eventTypeId, fullscreenChangeEvent, userData))
          e.preventDefault();
      };
      var eventHandler = {target, eventTypeString, callbackfunc, handlerFunc: fullscreenChangeEventhandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_fullscreenchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      if (!JSEvents.fullscreenEnabled())
        return -1;
      target = findEventTarget(target);
      if (!target)
        return -4;
      registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange");
      registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange");
      return 0;
    }
    function registerGamepadEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.gamepadEvent)
        JSEvents.gamepadEvent = _malloc(1432);
      var gamepadEventHandlerFunc = function(ev) {
        var e = ev || event;
        var gamepadEvent = JSEvents.gamepadEvent;
        fillGamepadEventData(gamepadEvent, e["gamepad"]);
        if (wasmTable.get(callbackfunc)(eventTypeId, gamepadEvent, userData))
          e.preventDefault();
      };
      var eventHandler = {target: findEventTarget(target), allowsDeferredCalls: true, eventTypeString, callbackfunc, handlerFunc: gamepadEventHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_gamepadconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
      if (!navigator.getGamepads && !navigator.webkitGetGamepads)
        return -1;
      registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 26, "gamepadconnected");
      return 0;
    }
    function _emscripten_set_gamepaddisconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
      if (!navigator.getGamepads && !navigator.webkitGetGamepads)
        return -1;
      registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 27, "gamepaddisconnected");
      return 0;
    }
    function registerKeyEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.keyEvent)
        JSEvents.keyEvent = _malloc(164);
      var keyEventHandlerFunc = function(e) {
        var keyEventData = JSEvents.keyEvent;
        var idx = keyEventData >> 2;
        HEAP32[idx + 0] = e.location;
        HEAP32[idx + 1] = e.ctrlKey;
        HEAP32[idx + 2] = e.shiftKey;
        HEAP32[idx + 3] = e.altKey;
        HEAP32[idx + 4] = e.metaKey;
        HEAP32[idx + 5] = e.repeat;
        HEAP32[idx + 6] = e.charCode;
        HEAP32[idx + 7] = e.keyCode;
        HEAP32[idx + 8] = e.which;
        stringToUTF8(e.key || "", keyEventData + 36, 32);
        stringToUTF8(e.code || "", keyEventData + 68, 32);
        stringToUTF8(e.char || "", keyEventData + 100, 32);
        stringToUTF8(e.locale || "", keyEventData + 132, 32);
        if (wasmTable.get(callbackfunc)(eventTypeId, keyEventData, userData))
          e.preventDefault();
      };
      var eventHandler = {target: findEventTarget(target), allowsDeferredCalls: true, eventTypeString, callbackfunc, handlerFunc: keyEventHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_keydown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown");
      return 0;
    }
    function _emscripten_set_keypress_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerKeyEventCallback(target, userData, useCapture, callbackfunc, 1, "keypress");
      return 0;
    }
    function _emscripten_set_keyup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup");
      return 0;
    }
    function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
      var browserIterationFunc = wasmTable.get(func);
      setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop);
    }
    function fillMouseEventData(eventStruct, e, target) {
      var idx = eventStruct >> 2;
      HEAP32[idx + 0] = e.screenX;
      HEAP32[idx + 1] = e.screenY;
      HEAP32[idx + 2] = e.clientX;
      HEAP32[idx + 3] = e.clientY;
      HEAP32[idx + 4] = e.ctrlKey;
      HEAP32[idx + 5] = e.shiftKey;
      HEAP32[idx + 6] = e.altKey;
      HEAP32[idx + 7] = e.metaKey;
      HEAP16[idx * 2 + 16] = e.button;
      HEAP16[idx * 2 + 17] = e.buttons;
      HEAP32[idx + 9] = e["movementX"];
      HEAP32[idx + 10] = e["movementY"];
      var rect = getBoundingClientRect(target);
      HEAP32[idx + 11] = e.clientX - rect.left;
      HEAP32[idx + 12] = e.clientY - rect.top;
    }
    function registerMouseEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.mouseEvent)
        JSEvents.mouseEvent = _malloc(64);
      target = findEventTarget(target);
      var mouseEventHandlerFunc = function(ev) {
        var e = ev || event;
        fillMouseEventData(JSEvents.mouseEvent, e, target);
        if (wasmTable.get(callbackfunc)(eventTypeId, JSEvents.mouseEvent, userData))
          e.preventDefault();
      };
      var eventHandler = {target, allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave", eventTypeString, callbackfunc, handlerFunc: mouseEventHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_mousedown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown");
      return 0;
    }
    function _emscripten_set_mouseenter_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerMouseEventCallback(target, userData, useCapture, callbackfunc, 33, "mouseenter");
      return 0;
    }
    function _emscripten_set_mouseleave_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerMouseEventCallback(target, userData, useCapture, callbackfunc, 34, "mouseleave");
      return 0;
    }
    function _emscripten_set_mousemove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove");
      return 0;
    }
    function _emscripten_set_mouseup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup");
      return 0;
    }
    function fillPointerlockChangeEventData(eventStruct) {
      var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
      var isPointerlocked = !!pointerLockElement;
      HEAP32[eventStruct >> 2] = isPointerlocked;
      var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
      var id = pointerLockElement && pointerLockElement.id ? pointerLockElement.id : "";
      stringToUTF8(nodeName, eventStruct + 4, 128);
      stringToUTF8(id, eventStruct + 132, 128);
    }
    function registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.pointerlockChangeEvent)
        JSEvents.pointerlockChangeEvent = _malloc(260);
      var pointerlockChangeEventHandlerFunc = function(ev) {
        var e = ev || event;
        var pointerlockChangeEvent = JSEvents.pointerlockChangeEvent;
        fillPointerlockChangeEventData(pointerlockChangeEvent);
        if (wasmTable.get(callbackfunc)(eventTypeId, pointerlockChangeEvent, userData))
          e.preventDefault();
      };
      var eventHandler = {target, eventTypeString, callbackfunc, handlerFunc: pointerlockChangeEventHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_pointerlockchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      if (!document || !document.body || !document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
        return -1;
      }
      target = findEventTarget(target);
      if (!target)
        return -4;
      registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "pointerlockchange");
      registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mozpointerlockchange");
      registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "webkitpointerlockchange");
      registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mspointerlockchange");
      return 0;
    }
    function registerUiEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.uiEvent)
        JSEvents.uiEvent = _malloc(36);
      target = findEventTarget(target);
      var uiEventHandlerFunc = function(ev) {
        var e = ev || event;
        if (e.target != target) {
          return;
        }
        var b = document.body;
        if (!b) {
          return;
        }
        var uiEvent = JSEvents.uiEvent;
        HEAP32[uiEvent >> 2] = e.detail;
        HEAP32[uiEvent + 4 >> 2] = b.clientWidth;
        HEAP32[uiEvent + 8 >> 2] = b.clientHeight;
        HEAP32[uiEvent + 12 >> 2] = innerWidth;
        HEAP32[uiEvent + 16 >> 2] = innerHeight;
        HEAP32[uiEvent + 20 >> 2] = outerWidth;
        HEAP32[uiEvent + 24 >> 2] = outerHeight;
        HEAP32[uiEvent + 28 >> 2] = pageXOffset;
        HEAP32[uiEvent + 32 >> 2] = pageYOffset;
        if (wasmTable.get(callbackfunc)(eventTypeId, uiEvent, userData))
          e.preventDefault();
      };
      var eventHandler = {target, eventTypeString, callbackfunc, handlerFunc: uiEventHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_resize_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize");
      return 0;
    }
    function registerTouchEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.touchEvent)
        JSEvents.touchEvent = _malloc(1684);
      target = findEventTarget(target);
      var touchEventHandlerFunc = function(e) {
        var touches = {};
        var et = e.touches;
        for (var i2 = 0; i2 < et.length; ++i2) {
          var touch = et[i2];
          touches[touch.identifier] = touch;
        }
        et = e.changedTouches;
        for (var i2 = 0; i2 < et.length; ++i2) {
          var touch = et[i2];
          touch.isChanged = 1;
          touches[touch.identifier] = touch;
        }
        et = e.targetTouches;
        for (var i2 = 0; i2 < et.length; ++i2) {
          touches[et[i2].identifier].onTarget = 1;
        }
        var touchEvent = JSEvents.touchEvent;
        var idx = touchEvent >> 2;
        HEAP32[idx + 1] = e.ctrlKey;
        HEAP32[idx + 2] = e.shiftKey;
        HEAP32[idx + 3] = e.altKey;
        HEAP32[idx + 4] = e.metaKey;
        idx += 5;
        var targetRect = getBoundingClientRect(target);
        var numTouches = 0;
        for (var i2 in touches) {
          var t = touches[i2];
          HEAP32[idx + 0] = t.identifier;
          HEAP32[idx + 1] = t.screenX;
          HEAP32[idx + 2] = t.screenY;
          HEAP32[idx + 3] = t.clientX;
          HEAP32[idx + 4] = t.clientY;
          HEAP32[idx + 5] = t.pageX;
          HEAP32[idx + 6] = t.pageY;
          HEAP32[idx + 7] = t.isChanged;
          HEAP32[idx + 8] = t.onTarget;
          HEAP32[idx + 9] = t.clientX - targetRect.left;
          HEAP32[idx + 10] = t.clientY - targetRect.top;
          idx += 13;
          if (++numTouches > 31) {
            break;
          }
        }
        HEAP32[touchEvent >> 2] = numTouches;
        if (wasmTable.get(callbackfunc)(eventTypeId, touchEvent, userData))
          e.preventDefault();
      };
      var eventHandler = {target, allowsDeferredCalls: eventTypeString == "touchstart" || eventTypeString == "touchend", eventTypeString, callbackfunc, handlerFunc: touchEventHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_touchcancel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel");
      return 0;
    }
    function _emscripten_set_touchend_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend");
      return 0;
    }
    function _emscripten_set_touchmove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove");
      return 0;
    }
    function _emscripten_set_touchstart_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart");
      return 0;
    }
    function fillVisibilityChangeEventData(eventStruct) {
      var visibilityStates = ["hidden", "visible", "prerender", "unloaded"];
      var visibilityState = visibilityStates.indexOf(document.visibilityState);
      HEAP32[eventStruct >> 2] = document.hidden;
      HEAP32[eventStruct + 4 >> 2] = visibilityState;
    }
    function registerVisibilityChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.visibilityChangeEvent)
        JSEvents.visibilityChangeEvent = _malloc(8);
      var visibilityChangeEventHandlerFunc = function(ev) {
        var e = ev || event;
        var visibilityChangeEvent = JSEvents.visibilityChangeEvent;
        fillVisibilityChangeEventData(visibilityChangeEvent);
        if (wasmTable.get(callbackfunc)(eventTypeId, visibilityChangeEvent, userData))
          e.preventDefault();
      };
      var eventHandler = {target, eventTypeString, callbackfunc, handlerFunc: visibilityChangeEventHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_visibilitychange_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
      registerVisibilityChangeEventCallback(specialHTMLTargets[1], userData, useCapture, callbackfunc, 21, "visibilitychange");
      return 0;
    }
    function registerWheelEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
      if (!JSEvents.wheelEvent)
        JSEvents.wheelEvent = _malloc(96);
      var wheelHandlerFunc = function(ev) {
        var e = ev || event;
        var wheelEvent = JSEvents.wheelEvent;
        fillMouseEventData(wheelEvent, e, target);
        HEAPF64[wheelEvent + 64 >> 3] = e["deltaX"];
        HEAPF64[wheelEvent + 72 >> 3] = e["deltaY"];
        HEAPF64[wheelEvent + 80 >> 3] = e["deltaZ"];
        HEAP32[wheelEvent + 88 >> 2] = e["deltaMode"];
        if (wasmTable.get(callbackfunc)(eventTypeId, wheelEvent, userData))
          e.preventDefault();
      };
      var eventHandler = {target, allowsDeferredCalls: true, eventTypeString, callbackfunc, handlerFunc: wheelHandlerFunc, useCapture};
      JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_wheel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
      target = findEventTarget(target);
      if (typeof target.onwheel !== "undefined") {
        registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel");
        return 0;
      } else {
        return -1;
      }
    }
    function _emscripten_sleep() {
      throw "Please compile your program with async support in order to use asynchronous operations like emscripten_sleep";
    }
    function _emscripten_thread_sleep(msecs) {
      var start = _emscripten_get_now();
      while (_emscripten_get_now() - start < msecs) {
      }
    }
    var ENV = {};
    function getExecutableName() {
      return thisProgram || "./this.program";
    }
    function getEnvStrings() {
      if (!getEnvStrings.strings) {
        var lang = (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        var env = {USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: lang, _: getExecutableName()};
        for (var x in ENV) {
          env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(x + "=" + env[x]);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    }
    function _environ_get(__environ, environ_buf) {
      try {
        var bufSize = 0;
        getEnvStrings().forEach(function(string, i2) {
          var ptr = environ_buf + bufSize;
          HEAP32[__environ + i2 * 4 >> 2] = ptr;
          writeAsciiToMemory(string, ptr);
          bufSize += string.length + 1;
        });
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return e.errno;
      }
    }
    function _environ_sizes_get(penviron_count, penviron_buf_size) {
      try {
        var strings = getEnvStrings();
        HEAP32[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach(function(string) {
          bufSize += string.length + 1;
        });
        HEAP32[penviron_buf_size >> 2] = bufSize;
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return e.errno;
      }
    }
    function _fd_close(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return e.errno;
      }
    }
    function _fd_fdstat_get(fd, pbuf) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
        HEAP8[pbuf >> 0] = type;
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return e.errno;
      }
    }
    function _fd_read(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doReadv(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return e.errno;
      }
    }
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var HIGH_OFFSET = 4294967296;
        var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
        var DOUBLE_LIMIT = 9007199254740992;
        if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
          return -61;
        }
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0)
          stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return e.errno;
      }
    }
    function _fd_write(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doWritev(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return e.errno;
      }
    }
    function _getTempRet0() {
      return getTempRet0() | 0;
    }
    function _gettimeofday(ptr) {
      var now = Date.now();
      HEAP32[ptr >> 2] = now / 1e3 | 0;
      HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
      return 0;
    }
    function _mktime(tmPtr) {
      _tzset();
      var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
      var dst = HEAP32[tmPtr + 32 >> 2];
      var guessedOffset = date.getTimezoneOffset();
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dstOffset = Math.min(winterOffset, summerOffset);
      if (dst < 0) {
        HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
      } else if (dst > 0 != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
      }
      HEAP32[tmPtr + 24 >> 2] = date.getDay();
      var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
      HEAP32[tmPtr + 28 >> 2] = yday;
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
      HEAP32[tmPtr + 8 >> 2] = date.getHours();
      HEAP32[tmPtr + 12 >> 2] = date.getDate();
      HEAP32[tmPtr + 16 >> 2] = date.getMonth();
      return date.getTime() / 1e3 | 0;
    }
    function _setTempRet0($i) {
      setTempRet0($i | 0);
    }
    function _sigaction(signum, act, oldact) {
      return 0;
    }
    function _signal(sig, func) {
      return 0;
    }
    function _time(ptr) {
      var ret = Date.now() / 1e3 | 0;
      if (ptr) {
        HEAP32[ptr >> 2] = ret;
      }
      return ret;
    }
    var readAsmConstArgsArray = [];
    function readAsmConstArgs(sigPtr, buf) {
      readAsmConstArgsArray.length = 0;
      var ch;
      buf >>= 2;
      while (ch = HEAPU8[sigPtr++]) {
        var double = ch < 105;
        if (double && buf & 1)
          buf++;
        readAsmConstArgsArray.push(double ? HEAPF64[buf++ >> 1] : HEAP32[buf]);
        ++buf;
      }
      return readAsmConstArgsArray;
    }
    var FSNode = function(parent, name, mode, rdev) {
      if (!parent) {
        parent = this;
      }
      this.parent = parent;
      this.mount = parent.mount;
      this.mounted = null;
      this.id = FS.nextInode++;
      this.name = name;
      this.mode = mode;
      this.node_ops = {};
      this.stream_ops = {};
      this.rdev = rdev;
    };
    var readMode = 292 | 73;
    var writeMode = 146;
    Object.defineProperties(FSNode.prototype, {read: {get: function() {
      return (this.mode & readMode) === readMode;
    }, set: function(val) {
      val ? this.mode |= readMode : this.mode &= ~readMode;
    }}, write: {get: function() {
      return (this.mode & writeMode) === writeMode;
    }, set: function(val) {
      val ? this.mode |= writeMode : this.mode &= ~writeMode;
    }}, isFolder: {get: function() {
      return FS.isDir(this.mode);
    }}, isDevice: {get: function() {
      return FS.isChrdev(this.mode);
    }}});
    FS.FSNode = FSNode;
    FS.staticInit();
    embind_init_charCodes();
    BindingError = Module2["BindingError"] = extendError(Error, "BindingError");
    InternalError = Module2["InternalError"] = extendError(Error, "InternalError");
    init_emval();
    UnboundTypeError = Module2["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
    Module2["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas) {
      Browser.requestFullscreen(lockPointer, resizeCanvas);
    };
    Module2["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
      Browser.requestAnimationFrame(func);
    };
    Module2["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
      Browser.setCanvasSize(width, height, noUpdates);
    };
    Module2["pauseMainLoop"] = function Module_pauseMainLoop() {
      Browser.mainLoop.pause();
    };
    Module2["resumeMainLoop"] = function Module_resumeMainLoop() {
      Browser.mainLoop.resume();
    };
    Module2["getUserMedia"] = function Module_getUserMedia() {
      Browser.getUserMedia();
    };
    Module2["createContext"] = function Module_createContext(canvas2, useWebGL, setInModule, webGLContextAttributes) {
      return Browser.createContext(canvas2, useWebGL, setInModule, webGLContextAttributes);
    };
    var GLctx;
    for (var i = 0; i < 32; ++i)
      tempFixedLengthArray.push(new Array(i));
    var miniTempWebGLFloatBuffersStorage = new Float32Array(288);
    for (var i = 0; i < 288; ++i) {
      miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i + 1);
    }
    var __miniTempWebGLIntBuffersStorage = new Int32Array(288);
    for (var i = 0; i < 288; ++i) {
      __miniTempWebGLIntBuffers[i] = __miniTempWebGLIntBuffersStorage.subarray(0, i + 1);
    }
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull)
        u8array.length = numBytesWritten;
      return u8array;
    }
    var asmLibraryArg = {p: ___cxa_allocate_exception, b: ___cxa_rethrow, o: ___cxa_throw, ab: ___localtime_r, cb: ___sys_access, ma: ___sys_fcntl64, hb: ___sys_fstat64, ib: ___sys_fstatat64, kb: ___sys_getdents64, fb: ___sys_ioctl, jb: ___sys_mkdir, mb: ___sys_mmap2, lb: ___sys_munmap, oa: ___sys_open, db: ___sys_rmdir, na: ___sys_stat64, bb: ___sys_unlink, we: __embind_register_bool, ve: __embind_register_emval, sa: __embind_register_float, c: __embind_register_function, k: __embind_register_integer, i: __embind_register_memory_view, ta: __embind_register_std_string, I: __embind_register_std_wstring, xe: __embind_register_void, F: __emval_as, B: __emval_call, Qa: __emval_call_method, a: __emval_decref, Sa: __emval_get_global, Ra: __emval_get_method_caller, u: __emval_get_property, g: __emval_incref, v: __emval_new_array, f: __emval_new_cstring, z: __emval_new_object, y: __emval_run_destructors, e: __emval_set_property, h: __emval_take_value, H: _abort, gb: _alBufferData, yb: _alDeleteBuffers, nb: _alGenBuffers, Sc: _alGenSources, pa: _alGetSourcei, qa: _alListener3f, nc: _alListenerfv, Ta: _alSourcePlay, Ya: _alSourceQueueBuffers, cc: _alSourceStop, Jb: _alSourceUnqueueBuffers, ra: _alSourcef, md: _alcCreateContext, bd: _alcMakeContextCurrent, xd: _alcOpenDevice, G: _clock, t: _clock_gettime, va: _dlclose, Ka: _eglBindAPI, Na: _eglChooseConfig, Ba: _eglCreateContext, Da: _eglCreateWindowSurface, Ca: _eglDestroyContext, Ea: _eglDestroySurface, Oa: _eglGetConfigAttrib, ja: _eglGetDisplay, Aa: _eglGetError, La: _eglInitialize, Fa: _eglMakeCurrent, za: _eglQueryString, Ga: _eglSwapBuffers, Ha: _eglSwapInterval, Ma: _eglTerminate, Ja: _eglWaitGL, Ia: _eglWaitNative, d: _emscripten_asm_const_int, s: _emscripten_cancel_main_loop, wa: _emscripten_exit_fullscreen, ya: _emscripten_exit_pointerlock, w: _emscripten_get_device_pixel_ratio, m: _emscripten_get_element_css_size, M: _emscripten_get_gamepad_status, ua: _emscripten_get_num_gamepads, be: _emscripten_glActiveTexture, ae: _emscripten_glAttachShader, re: _emscripten_glBeginQueryEXT, $d: _emscripten_glBindAttribLocation, _d: _emscripten_glBindBuffer, Zd: _emscripten_glBindFramebuffer, Yd: _emscripten_glBindRenderbuffer, Xd: _emscripten_glBindTexture, je: _emscripten_glBindVertexArrayOES, Wd: _emscripten_glBlendColor, Vd: _emscripten_glBlendEquation, Ud: _emscripten_glBlendEquationSeparate, Td: _emscripten_glBlendFunc, Sd: _emscripten_glBlendFuncSeparate, Rd: _emscripten_glBufferData, Qd: _emscripten_glBufferSubData, Pd: _emscripten_glCheckFramebufferStatus, Od: _emscripten_glClear, Nd: _emscripten_glClearColor, Md: _emscripten_glClearDepthf, Ld: _emscripten_glClearStencil, Kd: _emscripten_glColorMask, Jd: _emscripten_glCompileShader, Id: _emscripten_glCompressedTexImage2D, Hd: _emscripten_glCompressedTexSubImage2D, Gd: _emscripten_glCopyTexImage2D, Fd: _emscripten_glCopyTexSubImage2D, Ed: _emscripten_glCreateProgram, Dd: _emscripten_glCreateShader, Cd: _emscripten_glCullFace, Bd: _emscripten_glDeleteBuffers, Ad: _emscripten_glDeleteFramebuffers, zd: _emscripten_glDeleteProgram, te: _emscripten_glDeleteQueriesEXT, yd: _emscripten_glDeleteRenderbuffers, wd: _emscripten_glDeleteShader, vd: _emscripten_glDeleteTextures, ie: _emscripten_glDeleteVertexArraysOES, ud: _emscripten_glDepthFunc, td: _emscripten_glDepthMask, sd: _emscripten_glDepthRangef, rd: _emscripten_glDetachShader, qd: _emscripten_glDisable, pd: _emscripten_glDisableVertexAttribArray, od: _emscripten_glDrawArrays, ee: _emscripten_glDrawArraysInstancedANGLE, fe: _emscripten_glDrawBuffersWEBGL, nd: _emscripten_glDrawElements, de: _emscripten_glDrawElementsInstancedANGLE, ld: _emscripten_glEnable, kd: _emscripten_glEnableVertexAttribArray, qe: _emscripten_glEndQueryEXT, jd: _emscripten_glFinish, id: _emscripten_glFlush, hd: _emscripten_glFramebufferRenderbuffer, gd: _emscripten_glFramebufferTexture2D, fd: _emscripten_glFrontFace, ed: _emscripten_glGenBuffers, cd: _emscripten_glGenFramebuffers, ue: _emscripten_glGenQueriesEXT, ad: _emscripten_glGenRenderbuffers, $c: _emscripten_glGenTextures, he: _emscripten_glGenVertexArraysOES, dd: _emscripten_glGenerateMipmap, _c: _emscripten_glGetActiveAttrib, Zc: _emscripten_glGetActiveUniform, Yc: _emscripten_glGetAttachedShaders, Xc: _emscripten_glGetAttribLocation, Wc: _emscripten_glGetBooleanv, Vc: _emscripten_glGetBufferParameteriv, Uc: _emscripten_glGetError, Tc: _emscripten_glGetFloatv, Rc: _emscripten_glGetFramebufferAttachmentParameteriv, Qc: _emscripten_glGetIntegerv, Oc: _emscripten_glGetProgramInfoLog, Pc: _emscripten_glGetProgramiv, le: _emscripten_glGetQueryObjecti64vEXT, ne: _emscripten_glGetQueryObjectivEXT, ke: _emscripten_glGetQueryObjectui64vEXT, me: _emscripten_glGetQueryObjectuivEXT, oe: _emscripten_glGetQueryivEXT, Nc: _emscripten_glGetRenderbufferParameteriv, Lc: _emscripten_glGetShaderInfoLog, Kc: _emscripten_glGetShaderPrecisionFormat, Jc: _emscripten_glGetShaderSource, Mc: _emscripten_glGetShaderiv, Ic: _emscripten_glGetString, Hc: _emscripten_glGetTexParameterfv, Gc: _emscripten_glGetTexParameteriv, Dc: _emscripten_glGetUniformLocation, Fc: _emscripten_glGetUniformfv, Ec: _emscripten_glGetUniformiv, Ac: _emscripten_glGetVertexAttribPointerv, Cc: _emscripten_glGetVertexAttribfv, Bc: _emscripten_glGetVertexAttribiv, zc: _emscripten_glHint, yc: _emscripten_glIsBuffer, xc: _emscripten_glIsEnabled, wc: _emscripten_glIsFramebuffer, vc: _emscripten_glIsProgram, se: _emscripten_glIsQueryEXT, uc: _emscripten_glIsRenderbuffer, tc: _emscripten_glIsShader, sc: _emscripten_glIsTexture, ge: _emscripten_glIsVertexArrayOES, rc: _emscripten_glLineWidth, qc: _emscripten_glLinkProgram, pc: _emscripten_glPixelStorei, oc: _emscripten_glPolygonOffset, pe: _emscripten_glQueryCounterEXT, mc: _emscripten_glReadPixels, lc: _emscripten_glReleaseShaderCompiler, kc: _emscripten_glRenderbufferStorage, jc: _emscripten_glSampleCoverage, ic: _emscripten_glScissor, hc: _emscripten_glShaderBinary, gc: _emscripten_glShaderSource, fc: _emscripten_glStencilFunc, ec: _emscripten_glStencilFuncSeparate, dc: _emscripten_glStencilMask, bc: _emscripten_glStencilMaskSeparate, ac: _emscripten_glStencilOp, $b: _emscripten_glStencilOpSeparate, _b: _emscripten_glTexImage2D, Zb: _emscripten_glTexParameterf, Yb: _emscripten_glTexParameterfv, Xb: _emscripten_glTexParameteri, Wb: _emscripten_glTexParameteriv, Vb: _emscripten_glTexSubImage2D, Ub: _emscripten_glUniform1f, Tb: _emscripten_glUniform1fv, Sb: _emscripten_glUniform1i, Rb: _emscripten_glUniform1iv, Qb: _emscripten_glUniform2f, Pb: _emscripten_glUniform2fv, Ob: _emscripten_glUniform2i, Nb: _emscripten_glUniform2iv, Mb: _emscripten_glUniform3f, Lb: _emscripten_glUniform3fv, Kb: _emscripten_glUniform3i, Ib: _emscripten_glUniform3iv, Hb: _emscripten_glUniform4f, Gb: _emscripten_glUniform4fv, Fb: _emscripten_glUniform4i, Eb: _emscripten_glUniform4iv, Db: _emscripten_glUniformMatrix2fv, Cb: _emscripten_glUniformMatrix3fv, Bb: _emscripten_glUniformMatrix4fv, Ab: _emscripten_glUseProgram, zb: _emscripten_glValidateProgram, xb: _emscripten_glVertexAttrib1f, wb: _emscripten_glVertexAttrib1fv, vb: _emscripten_glVertexAttrib2f, ub: _emscripten_glVertexAttrib2fv, tb: _emscripten_glVertexAttrib3f, sb: _emscripten_glVertexAttrib3fv, rb: _emscripten_glVertexAttrib4f, qb: _emscripten_glVertexAttrib4fv, ce: _emscripten_glVertexAttribDivisorANGLE, pb: _emscripten_glVertexAttribPointer, ob: _emscripten_glViewport, E: _emscripten_has_asyncify, n: _emscripten_longjmp, Va: _emscripten_memcpy_big, xa: _emscripten_request_fullscreen_strategy, ha: _emscripten_request_pointerlock, Wa: _emscripten_resize_heap, N: _emscripten_sample_gamepad_data, O: _emscripten_set_beforeunload_callback_on_thread, _: _emscripten_set_blur_callback_on_thread, r: _emscripten_set_canvas_element_size, C: _emscripten_set_element_css_size, $: _emscripten_set_focus_callback_on_thread, R: _emscripten_set_fullscreenchange_callback_on_thread, L: _emscripten_set_gamepadconnected_callback_on_thread, K: _emscripten_set_gamepaddisconnected_callback_on_thread, U: _emscripten_set_keydown_callback_on_thread, S: _emscripten_set_keypress_callback_on_thread, T: _emscripten_set_keyup_callback_on_thread, ka: _emscripten_set_main_loop, ea: _emscripten_set_mousedown_callback_on_thread, ca: _emscripten_set_mouseenter_callback_on_thread, ba: _emscripten_set_mouseleave_callback_on_thread, fa: _emscripten_set_mousemove_callback_on_thread, da: _emscripten_set_mouseup_callback_on_thread, V: _emscripten_set_pointerlockchange_callback_on_thread, Q: _emscripten_set_resize_callback_on_thread, W: _emscripten_set_touchcancel_callback_on_thread, Y: _emscripten_set_touchend_callback_on_thread, X: _emscripten_set_touchmove_callback_on_thread, Z: _emscripten_set_touchstart_callback_on_thread, P: _emscripten_set_visibilitychange_callback_on_thread, aa: _emscripten_set_wheel_callback_on_thread, D: _emscripten_sleep, $a: _emscripten_thread_sleep, Za: _environ_get, _a: _environ_sizes_get, A: _fd_close, Xa: _fd_fdstat_get, eb: _fd_read, Ua: _fd_seek, la: _fd_write, x: _getTempRet0, J: _gettimeofday, ga: invoke_ii, ia: invoke_vii, ye: _mktime, j: _setTempRet0, l: _sigaction, Pa: _signal, q: _time};
    var asm = createWasm();
    var ___wasm_call_ctors = Module2["___wasm_call_ctors"] = function() {
      return (___wasm_call_ctors = Module2["___wasm_call_ctors"] = Module2["asm"]["Ae"]).apply(null, arguments);
    };
    var _free = Module2["_free"] = function() {
      return (_free = Module2["_free"] = Module2["asm"]["Be"]).apply(null, arguments);
    };
    var _memset = Module2["_memset"] = function() {
      return (_memset = Module2["_memset"] = Module2["asm"]["Ce"]).apply(null, arguments);
    };
    var _malloc = Module2["_malloc"] = function() {
      return (_malloc = Module2["_malloc"] = Module2["asm"]["De"]).apply(null, arguments);
    };
    var ___errno_location = Module2["___errno_location"] = function() {
      return (___errno_location = Module2["___errno_location"] = Module2["asm"]["Fe"]).apply(null, arguments);
    };
    var ___getTypeName = Module2["___getTypeName"] = function() {
      return (___getTypeName = Module2["___getTypeName"] = Module2["asm"]["Ge"]).apply(null, arguments);
    };
    var ___embind_register_native_and_builtin_types = Module2["___embind_register_native_and_builtin_types"] = function() {
      return (___embind_register_native_and_builtin_types = Module2["___embind_register_native_and_builtin_types"] = Module2["asm"]["He"]).apply(null, arguments);
    };
    var __get_tzname = Module2["__get_tzname"] = function() {
      return (__get_tzname = Module2["__get_tzname"] = Module2["asm"]["Ie"]).apply(null, arguments);
    };
    var __get_daylight = Module2["__get_daylight"] = function() {
      return (__get_daylight = Module2["__get_daylight"] = Module2["asm"]["Je"]).apply(null, arguments);
    };
    var __get_timezone = Module2["__get_timezone"] = function() {
      return (__get_timezone = Module2["__get_timezone"] = Module2["asm"]["Ke"]).apply(null, arguments);
    };
    var stackSave = Module2["stackSave"] = function() {
      return (stackSave = Module2["stackSave"] = Module2["asm"]["Le"]).apply(null, arguments);
    };
    var stackRestore = Module2["stackRestore"] = function() {
      return (stackRestore = Module2["stackRestore"] = Module2["asm"]["Me"]).apply(null, arguments);
    };
    var stackAlloc = Module2["stackAlloc"] = function() {
      return (stackAlloc = Module2["stackAlloc"] = Module2["asm"]["Ne"]).apply(null, arguments);
    };
    var _setThrew = Module2["_setThrew"] = function() {
      return (_setThrew = Module2["_setThrew"] = Module2["asm"]["Oe"]).apply(null, arguments);
    };
    var _memalign = Module2["_memalign"] = function() {
      return (_memalign = Module2["_memalign"] = Module2["asm"]["Pe"]).apply(null, arguments);
    };
    var dynCall_jii = Module2["dynCall_jii"] = function() {
      return (dynCall_jii = Module2["dynCall_jii"] = Module2["asm"]["Qe"]).apply(null, arguments);
    };
    var dynCall_jiji = Module2["dynCall_jiji"] = function() {
      return (dynCall_jiji = Module2["dynCall_jiji"] = Module2["asm"]["Re"]).apply(null, arguments);
    };
    var dynCall_ji = Module2["dynCall_ji"] = function() {
      return (dynCall_ji = Module2["dynCall_ji"] = Module2["asm"]["Se"]).apply(null, arguments);
    };
    function invoke_vii(index, a1, a2) {
      var sp = stackSave();
      try {
        wasmTable.get(index)(a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
          throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_ii(index, a1) {
      var sp = stackSave();
      try {
        return wasmTable.get(index)(a1);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
          throw e;
        _setThrew(1, 0);
      }
    }
    var calledRun;
    function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + status + ")";
      this.status = status;
    }
    dependenciesFulfilled = function runCaller() {
      if (!calledRun)
        run();
      if (!calledRun)
        dependenciesFulfilled = runCaller;
    };
    function run(args) {
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun)
          return;
        calledRun = true;
        Module2["calledRun"] = true;
        if (ABORT)
          return;
        initRuntime();
        preMain();
        readyPromiseResolve(Module2);
        if (Module2["onRuntimeInitialized"])
          Module2["onRuntimeInitialized"]();
        postRun();
      }
      if (Module2["setStatus"]) {
        Module2["setStatus"]("Running...");
        setTimeout(function() {
          setTimeout(function() {
            Module2["setStatus"]("");
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    Module2["run"] = run;
    if (Module2["preInit"]) {
      if (typeof Module2["preInit"] == "function")
        Module2["preInit"] = [Module2["preInit"]];
      while (Module2["preInit"].length > 0) {
        Module2["preInit"].pop()();
      }
    }
    run();
    return Module2.ready;
  };
}();
const Emulator = {
  Famicom: "Famicom",
  SuperFamicom: "Super Famicom",
  MegaDrive: "Mega Drive"
};
const EmulatorEvent = {
  FrameStart: "frame.start",
  FrameEnd: "frame.end",
  Resize: "resize"
};
const Settings = {
  [Emulator.SuperFamicom]: {
    CPU: {
      Lockstep: "cpu/lockstep",
      Fastmath: "cpu/fastmath",
      Overclock: "cpu/overclock"
    },
    SMP: {
      Lockstep: "smp/lockstep"
    },
    DSP: {
      Enabled: "dsp/enabled"
    },
    PPU: {
      Skipframe: "ppu/skipframe"
    }
  },
  [Emulator.Famicom]: {
    PPU: {
      Skipframe: "ppu/skipframe",
      Overscan: "ppu/overscan"
    },
    CPU: {
      SyncOnce: "cpu/synconce"
    }
  },
  [Emulator.MegaDrive]: {
    CPU: {
      Overclock: "cpu/overclock"
    },
    PPU: {
      Skipframe: "ppu/skipframe",
      OptimizeSteps: "vdp/optimizeSteps"
    }
  }
};
let lib;
let compiled = false;
let initialized = false;
const version = "0.16.0";
const commit = "f528c6e";
const dirty = true;
function getBinaryPath() {
  try {
    return window.byuuWasmPath;
  } catch (error) {
    throw new Error("Failed to load WASM code - see https://github.com/Wizcorp/byuu-web#failed-to-load-wasm-code");
  }
}
function getModule() {
  if (!compiled) {
    throw new Error("Emulator module was not initialized before use");
  }
  return lib;
}
const byuu = new EventEmitter();
const container = document.createElement("div");
Object.assign(container.style, {
  position: "relative",
  display: "flex",
  height: "100%",
  width: "100%",
  flexDirection: "column",
  flexWrap: "wrap",
  alignItems: "flex-start"
});
const canvas = document.createElement("canvas");
const getContext = canvas.getContext.bind(canvas);
canvas.id = "byuuCanvas";
Object.assign(canvas.style, {
  height: "100%",
  width: "100%",
  objectFit: "contain"
});
const contextOptions = {
  preserveDrawingBuffer: true,
  powerPreference: "high-performance",
  alpha: false,
  desynchronized: true,
  antialias: false
};
canvas.getContext = function(contextId, options) {
  options = options || {};
  if (contextId === "webgl") {
    Object.assign(options, contextOptions);
  }
  return getContext(contextId, options);
};
container.appendChild(canvas);
byuu.displayRatio = 1;
byuu.compile = async function() {
  if (compiled) {
    return lib;
  }
  return new Promise((resolve) => {
    Module({
      locateFile: (filename, prefix) => {
        if (filename === "byuu-web-lib.wasm") {
          return getBinaryPath();
        }
        return prefix + filename;
      },
      canvas
    }).then((result) => {
      compiled = true;
      lib = result;
      resolve(lib);
    });
  });
};
byuu.initialize = async function(parent, ctxOptions) {
  if (!parent) {
    throw new Error("container parameter is not defined");
  }
  ctxOptions = ctxOptions || {};
  Object.assign(contextOptions, ctxOptions);
  parent.appendChild(container);
  const domElementWithIDCanvas = document.getElementById("byuuCanvas");
  if (domElementWithIDCanvas && !canvas.isSameNode(domElementWithIDCanvas)) {
    throw new Error(`The DOM ID attribute "byuuCanvas" is reserved by byuu for it's own canvas`);
  }
  if (initialized) {
    return;
  }
  return byuu.compile().then((lib2) => {
    lib2.initialize(document.title || "byuu");
    lib2.onFrameStart(() => byuu.emit("frame.start"));
    lib2.onFrameEnd(() => byuu.emit("frame.end"));
    lib2.onResize((width, height) => {
      byuu.displayRatio = width / height;
      byuu.emit("resize", {width, height});
    });
    initialized = true;
  });
};
byuu.terminate = () => {
  getModule().terminate();
  container.parentElement.removeChild(container);
};
byuu.setFit = (fit) => Object.assign(canvas.style, {objectFit: fit});
byuu.setPosition = (position) => Object.assign(canvas.style, {objectPosition: position});
byuu.getCanvas = () => canvas;
byuu.getEmulatorForFilename = (filename) => getModule().getEmulatorForFilename(filename);
byuu.setEmulator = (emulator) => getModule().setEmulator(emulator);
byuu.setEmulatorForFilename = (filename) => getModule().setEmulatorForFilename(filename);
byuu.load = (romData, saveFiles) => getModule().load(romData, saveFiles || {});
byuu.loadURL = async (url, saveFiles) => {
  if (!byuu.setEmulatorForFilename(url)) {
    throw new Error("ROM file extension is not supported");
  }
  return fetch(url).then((response) => response.arrayBuffer()).then((buffer) => byuu.load(new Uint8Array(buffer), saveFiles));
};
byuu.unload = () => getModule().unload();
byuu.start = () => getModule().start();
byuu.run = () => getModule().run();
byuu.stop = () => getModule().stop();
byuu.isStarted = () => getModule().isStarted();
byuu.isRunning = () => getModule().isRunning();
byuu.setVolume = (volume) => getModule().setVolume(volume);
byuu.setMute = (mute) => getModule().setMute(mute);
byuu.connectPeripheral = (portName, peripheralName) => getModule().connectPeripheral(portName, peripheralName);
byuu.disconnectPeripheral = (portName) => getModule().disconnectPeripheral(portName);
byuu.setButton = (portName, buttonName, value) => getModule().setButton(portName, buttonName, value);
byuu.getROMInfo = (filename, romData) => getModule().getROMInfo(filename, romData);
byuu.stateSave = async () => new Promise((resolve) => {
  getModule().stateSave(({buffer, byteOffset, byteLength}) => {
    const array = new Uint8Array(buffer.slice(byteOffset, byteOffset + byteLength));
    resolve(array);
  });
});
byuu.stateLoad = (stateData) => getModule().stateLoad(stateData);
byuu.save = () => {
  const saveFiles = getModule().save();
  for (const [filename, {buffer, byteOffset, byteLength}] of Object.entries(saveFiles)) {
    saveFiles[filename] = new Uint8Array(buffer.slice(byteOffset, byteOffset + byteLength));
  }
  return saveFiles;
};

window.byuu = byuu;
