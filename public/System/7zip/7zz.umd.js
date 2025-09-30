var SevenZip = (() => {
    var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
    return (
        async function(moduleArg = {}) {
            var moduleRtn;
            var inputed = false;

            var Module = moduleArg;
            var ENVIRONMENT_IS_WEB = typeof window == "object";
            var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";
            var ENVIRONMENT_IS_NODE = typeof process == "object" && process.versions?.node && process.type != "renderer";
            Module.noInitialRun = true;
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = (status, toThrow) => {
                throw toThrow
            };
            if (typeof __filename != "undefined") {
                _scriptName = __filename
            } else if (ENVIRONMENT_IS_WORKER) {
                _scriptName = self.location.href
            }
            var scriptDirectory = "";

            function locateFile(path) {
                if (Module["locateFile"]) {
                    return Module["locateFile"](path, scriptDirectory)
                }
                return scriptDirectory + path
            }
            var readAsync, readBinary;
            if (ENVIRONMENT_IS_NODE) {
                var fs = require("fs");
                scriptDirectory = __dirname + "/";
                readBinary = filename => {
                    filename = isFileURI(filename) ? new URL(filename) : filename;
                    var ret = fs.readFileSync(filename);
                    return ret
                };
                readAsync = async (filename, binary = true) => {
                    filename = isFileURI(filename) ? new URL(filename) : filename;
                    var ret = fs.readFileSync(filename, binary ? undefined : "utf8");
                    return ret
                };
                if (process.argv.length > 1) {
                    thisProgram = process.argv[1].replace(/\\/g, "/")
                }
                arguments_ = process.argv.slice(2);
                quit_ = (status, toThrow) => {
                    process.exitCode = status;
                    throw toThrow
                }
            } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
                try {
                    scriptDirectory = new URL(".", _scriptName).href
                } catch {} {
                    if (ENVIRONMENT_IS_WORKER) {
                        readBinary = url => {
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            xhr.responseType = "arraybuffer";
                            xhr.send(null);
                            return new Uint8Array(xhr.response)
                        }
                    }
                    readAsync = async url => {
                        if (isFileURI(url)) {
                            return new Promise((resolve, reject) => {
                                var xhr = new XMLHttpRequest;
                                xhr.open("GET", url, true);
                                xhr.responseType = "arraybuffer";
                                xhr.onload = () => {
                                    if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                                        resolve(xhr.response);
                                        return
                                    }
                                    reject(xhr.status)
                                };
                                xhr.onerror = reject;
                                xhr.send(null)
                            })
                        }
                        var response = await fetch(url, {
                            credentials: "same-origin"
                        });
                        if (response.ok) {
                            return response.arrayBuffer()
                        }
                        throw new Error(response.status + " : " + response.url)
                    }
                }
            } else {}
            var out = console.log.bind(console);
            var err = console.error.bind(console);
            var wasmBinary;
            var ABORT = false;
            var EXITSTATUS;

            function assert(condition, text) {
                if (!condition) {
                    abort(text)
                }
            }
            var isFileURI = filename => filename.startsWith("file://");
            var readyPromiseResolve, readyPromiseReject;
            var wasmMemory;
            var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
            var HEAP64, HEAPU64;
            var runtimeInitialized = false;

            function updateMemoryViews() {
                var b = wasmMemory.buffer;
                HEAP8 = new Int8Array(b);
                HEAP16 = new Int16Array(b);
                HEAPU8 = new Uint8Array(b);
                HEAPU16 = new Uint16Array(b);
                HEAP32 = new Int32Array(b);
                HEAPU32 = new Uint32Array(b);
                HEAPF32 = new Float32Array(b);
                HEAPF64 = new Float64Array(b);
                HEAP64 = new BigInt64Array(b);
                HEAPU64 = new BigUint64Array(b)
            }

            function preRun() {
                if (Module["preRun"]) {
                    if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                    while (Module["preRun"].length) {
                        addOnPreRun(Module["preRun"].shift())
                    }
                }
                callRuntimeCallbacks(onPreRuns)
            }

            function initRuntime() {
                runtimeInitialized = true;
                if (!Module["noFSInit"] && !FS.initialized) FS.init();
                TTY.init();
                wasmExports["__wasm_call_ctors"]();
                FS.ignorePermissions = false
            }

            function preMain() {}

            function postRun() {
                if (Module["postRun"]) {
                    if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                    while (Module["postRun"].length) {
                        addOnPostRun(Module["postRun"].shift())
                    }
                }
                callRuntimeCallbacks(onPostRuns)
            }
            var runDependencies = 0;
            var dependenciesFulfilled = null;

            function addRunDependency(id) {
                runDependencies++;
                Module["monitorRunDependencies"]?.(runDependencies)
            }

            function removeRunDependency(id) {
                runDependencies--;
                Module["monitorRunDependencies"]?.(runDependencies);
                if (runDependencies == 0) {
                    if (dependenciesFulfilled) {
                        var callback = dependenciesFulfilled;
                        dependenciesFulfilled = null;
                        callback()
                    }
                }
            }

            function abort(what) {
                Module["onAbort"]?.(what);
                what = "Aborted(" + what + ")";
                err(what);
                ABORT = true;
                what += ". Build with -sASSERTIONS for more info.";
                var e = new WebAssembly.RuntimeError(what);
                readyPromiseReject?.(e);
                throw e
            }
            var wasmBinaryFile;

            function findWasmBinary() {
                return locateFile("7zz.wasm")
            }

            function getBinarySync(file) {
                if (file == wasmBinaryFile && wasmBinary) {
                    return new Uint8Array(wasmBinary)
                }
                if (readBinary) {
                    return readBinary(file)
                }
                throw "both async and sync fetching of the wasm failed"
            }
            async function getWasmBinary(binaryFile) {
                if (!wasmBinary) {
                    try {
                        var response = await readAsync(binaryFile);
                        return new Uint8Array(response)
                    } catch {}
                }
                return getBinarySync(binaryFile)
            }
            async function instantiateArrayBuffer(binaryFile, imports) {
                try {
                    var binary = await getWasmBinary(binaryFile);
                    var instance = await WebAssembly.instantiate(binary, imports);
                    return instance
                } catch (reason) {
                    err(`failed to asynchronously prepare wasm: ${reason}`);
                    abort(reason)
                }
            }
            async function instantiateAsync(binary, binaryFile, imports) {
                if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE) {
                    try {
                        var response = fetch(binaryFile, {
                            credentials: "same-origin"
                        });
                        var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
                        return instantiationResult
                    } catch (reason) {
                        err(`wasm streaming compile failed: ${reason}`);
                        err("falling back to ArrayBuffer instantiation")
                    }
                }
                return instantiateArrayBuffer(binaryFile, imports)
            }

            function getWasmImports() {
                return {
                    env: wasmImports,
                    wasi_snapshot_preview1: wasmImports
                }
            }
            async function createWasm() {
                function receiveInstance(instance, module) {
                    wasmExports = instance.exports;
                    wasmMemory = wasmExports["memory"];
                    updateMemoryViews();
                    assignWasmExports(wasmExports);
                    removeRunDependency("wasm-instantiate");
                    return wasmExports
                }
                addRunDependency("wasm-instantiate");

                function receiveInstantiationResult(result) {
                    return receiveInstance(result["instance"])
                }
                var info = getWasmImports();
                if (Module["instantiateWasm"]) {
                    return new Promise((resolve, reject) => {
                        Module["instantiateWasm"](info, (mod, inst) => {
                            resolve(receiveInstance(mod, inst))
                        })
                    })
                }
                wasmBinaryFile ??= findWasmBinary();
                var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
                var exports = receiveInstantiationResult(result);
                return exports
            }
            class ExitStatus {
                name = "ExitStatus";
                constructor(status) {
                    this.message = `Program terminated with exit(${status})`;
                    this.status = status
                }
            }
            var callRuntimeCallbacks = callbacks => {
                while (callbacks.length > 0) {
                    callbacks.shift()(Module)
                }
            };
            var onPostRuns = [];
            var addOnPostRun = cb => onPostRuns.push(cb);
            var onPreRuns = [];
            var addOnPreRun = cb => onPreRuns.push(cb);
            var noExitRuntime = true;
            class ExceptionInfo {
                constructor(excPtr) {
                    this.excPtr = excPtr;
                    this.ptr = excPtr - 24
                }
                set_type(type) {
                    HEAPU32[this.ptr + 4 >> 2] = type
                }
                get_type() {
                    return HEAPU32[this.ptr + 4 >> 2]
                }
                set_destructor(destructor) {
                    HEAPU32[this.ptr + 8 >> 2] = destructor
                }
                get_destructor() {
                    return HEAPU32[this.ptr + 8 >> 2]
                }
                set_caught(caught) {
                    caught = caught ? 1 : 0;
                    HEAP8[this.ptr + 12] = caught
                }
                get_caught() {
                    return HEAP8[this.ptr + 12] != 0
                }
                set_rethrown(rethrown) {
                    rethrown = rethrown ? 1 : 0;
                    HEAP8[this.ptr + 13] = rethrown
                }
                get_rethrown() {
                    return HEAP8[this.ptr + 13] != 0
                }
                init(type, destructor) {
                    this.set_adjusted_ptr(0);
                    this.set_type(type);
                    this.set_destructor(destructor)
                }
                set_adjusted_ptr(adjustedPtr) {
                    HEAPU32[this.ptr + 16 >> 2] = adjustedPtr
                }
                get_adjusted_ptr() {
                    return HEAPU32[this.ptr + 16 >> 2]
                }
            }
            var exceptionLast = 0;
            var uncaughtExceptionCount = 0;
            var ___cxa_throw = (ptr, type, destructor) => {
                var info = new ExceptionInfo(ptr);
                info.init(type, destructor);
                exceptionLast = ptr;
                uncaughtExceptionCount++;
                throw exceptionLast
            };
            var PATH = {
                isAbs: path => path.charAt(0) === "/",
                splitPath: filename => {
                    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
                    return splitPathRe.exec(filename).slice(1)
                },
                normalizeArray: (parts, allowAboveRoot) => {
                    var up = 0;
                    for (var i = parts.length - 1; i >= 0; i--) {
                        var last = parts[i];
                        if (last === ".") {
                            parts.splice(i, 1)
                        } else if (last === "..") {
                            parts.splice(i, 1);
                            up++
                        } else if (up) {
                            parts.splice(i, 1);
                            up--
                        }
                    }
                    if (allowAboveRoot) {
                        for (; up; up--) {
                            parts.unshift("..")
                        }
                    }
                    return parts
                },
                normalize: path => {
                    var isAbsolute = PATH.isAbs(path),
                        trailingSlash = path.slice(-1) === "/";
                    path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
                    if (!path && !isAbsolute) {
                        path = "."
                    }
                    if (path && trailingSlash) {
                        path += "/"
                    }
                    return (isAbsolute ? "/" : "") + path
                },
                dirname: path => {
                    var result = PATH.splitPath(path),
                        root = result[0],
                        dir = result[1];
                    if (!root && !dir) {
                        return "."
                    }
                    if (dir) {
                        dir = dir.slice(0, -1)
                    }
                    return root + dir
                },
                basename: path => path && path.match(/([^\/]+|\/)\/*$/)[1],
                join: (...paths) => PATH.normalize(paths.join("/")),
                join2: (l, r) => PATH.normalize(l + "/" + r)
            };
            var initRandomFill = () => {
                if (ENVIRONMENT_IS_NODE) {
                    var nodeCrypto = require("crypto");
                    return view => nodeCrypto.randomFillSync(view)
                }
                return view => crypto.getRandomValues(view)
            };
            var randomFill = view => {
                (randomFill = initRandomFill())(view)
            };
            var PATH_FS = {
                resolve: (...args) => {
                    var resolvedPath = "",
                        resolvedAbsolute = false;
                    for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                        var path = i >= 0 ? args[i] : FS.cwd();
                        if (typeof path != "string") {
                            throw new TypeError("Arguments to path.resolve must be strings")
                        } else if (!path) {
                            return ""
                        }
                        resolvedPath = path + "/" + resolvedPath;
                        resolvedAbsolute = PATH.isAbs(path)
                    }
                    resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
                    return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
                },
                relative: (from, to) => {
                    from = PATH_FS.resolve(from).slice(1);
                    to = PATH_FS.resolve(to).slice(1);

                    function trim(arr) {
                        var start = 0;
                        for (; start < arr.length; start++) {
                            if (arr[start] !== "") break
                        }
                        var end = arr.length - 1;
                        for (; end >= 0; end--) {
                            if (arr[end] !== "") break
                        }
                        if (start > end) return [];
                        return arr.slice(start, end - start + 1)
                    }
                    var fromParts = trim(from.split("/"));
                    var toParts = trim(to.split("/"));
                    var length = Math.min(fromParts.length, toParts.length);
                    var samePartsLength = length;
                    for (var i = 0; i < length; i++) {
                        if (fromParts[i] !== toParts[i]) {
                            samePartsLength = i;
                            break
                        }
                    }
                    var outputParts = [];
                    for (var i = samePartsLength; i < fromParts.length; i++) {
                        outputParts.push("..")
                    }
                    outputParts = outputParts.concat(toParts.slice(samePartsLength));
                    return outputParts.join("/")
                }
            };
            var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;
            var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
                var endIdx = idx + maxBytesToRead;
                var endPtr = idx;
                while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
                if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
                }
                var str = "";
                while (idx < endPtr) {
                    var u0 = heapOrArray[idx++];
                    if (!(u0 & 128)) {
                        str += String.fromCharCode(u0);
                        continue
                    }
                    var u1 = heapOrArray[idx++] & 63;
                    if ((u0 & 224) == 192) {
                        str += String.fromCharCode((u0 & 31) << 6 | u1);
                        continue
                    }
                    var u2 = heapOrArray[idx++] & 63;
                    if ((u0 & 240) == 224) {
                        u0 = (u0 & 15) << 12 | u1 << 6 | u2
                    } else {
                        u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
                    }
                    if (u0 < 65536) {
                        str += String.fromCharCode(u0)
                    } else {
                        var ch = u0 - 65536;
                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                    }
                }
                return str
            };
            var FS_stdin_getChar_buffer = [];
            var lengthBytesUTF8 = str => {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var c = str.charCodeAt(i);
                    if (c <= 127) {
                        len++
                    } else if (c <= 2047) {
                        len += 2
                    } else if (c >= 55296 && c <= 57343) {
                        len += 4;
                        ++i
                    } else {
                        len += 3
                    }
                }
                return len
            };
            var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
                if (!(maxBytesToWrite > 0)) return 0;
                var startIdx = outIdx;
                var endIdx = outIdx + maxBytesToWrite - 1;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.codePointAt(i);
                    if (u <= 127) {
                        if (outIdx >= endIdx) break;
                        heap[outIdx++] = u
                    } else if (u <= 2047) {
                        if (outIdx + 1 >= endIdx) break;
                        heap[outIdx++] = 192 | u >> 6;
                        heap[outIdx++] = 128 | u & 63
                    } else if (u <= 65535) {
                        if (outIdx + 2 >= endIdx) break;
                        heap[outIdx++] = 224 | u >> 12;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    } else {
                        if (outIdx + 3 >= endIdx) break;
                        heap[outIdx++] = 240 | u >> 18;
                        heap[outIdx++] = 128 | u >> 12 & 63;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63;
                        i++
                    }
                }
                heap[outIdx] = 0;
                return outIdx - startIdx
            };
            var intArrayFromString = (stringy, dontAddNull, length) => {
                var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
                var u8array = new Array(len);
                var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
                if (dontAddNull) u8array.length = numBytesWritten;
                return u8array
            };
            var FS_stdin_getChar = () => {
                if (!FS_stdin_getChar_buffer.length) {
                    var result = null;
                    if (ENVIRONMENT_IS_NODE) {
                        var BUFSIZE = 256;
                        var buf = Buffer.alloc(BUFSIZE);
                        var bytesRead = 0;
                        var fd = process.stdin.fd;
                        try {
                            bytesRead = fs.readSync(fd, buf, 0, BUFSIZE)
                        } catch (e) {
                            if (e.toString().includes("EOF")) bytesRead = 0;
                            else throw e
                        }
                        if (bytesRead > 0) {
                            result = buf.slice(0, bytesRead).toString("utf-8")
                        }
                    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                        if (inputed) {
                          inputed = false;
                          return null;
                        }
                        result = window.prompt("Input: ");
                        if (result !== null) {
                            inputed = true;
                            result += "\n";
                        }
                    } else {}
                    if (!result) {
                        return null
                    }
                    FS_stdin_getChar_buffer = intArrayFromString(result, true)
                }
                return FS_stdin_getChar_buffer.shift()
            };
            var TTY = {
                ttys: [],
                init() {},
                shutdown() {},
                register(dev, ops) {
                    TTY.ttys[dev] = {
                        input: [],
                        output: [],
                        ops
                    };
                    FS.registerDevice(dev, TTY.stream_ops)
                },
                stream_ops: {
                    open(stream) {
                        var tty = TTY.ttys[stream.node.rdev];
                        if (!tty) {
                            throw new FS.ErrnoError(43)
                        }
                        stream.tty = tty;
                        stream.seekable = false
                    },
                    close(stream) {
                        stream.tty.ops.fsync(stream.tty)
                    },
                    fsync(stream) {
                        stream.tty.ops.fsync(stream.tty)
                    },
                    read(stream, buffer, offset, length, pos) {
                        if (!stream.tty || !stream.tty.ops.get_char) {
                            throw new FS.ErrnoError(60)
                        }
                        var bytesRead = 0;
                        for (var i = 0; i < length; i++) {
                            var result;
                            try {
                                result = stream.tty.ops.get_char(stream.tty)
                            } catch (e) {
                                throw new FS.ErrnoError(29)
                            }
                            if (result === undefined && bytesRead === 0) {
                                throw new FS.ErrnoError(6)
                            }
                            if (result === null || result === undefined) break;
                            bytesRead++;
                            buffer[offset + i] = result
                        }
                        if (bytesRead) {
                            stream.node.atime = Date.now()
                        }
                        return bytesRead
                    },
                    write(stream, buffer, offset, length, pos) {
                        if (!stream.tty || !stream.tty.ops.put_char) {
                            throw new FS.ErrnoError(60)
                        }
                        try {
                            for (var i = 0; i < length; i++) {
                                stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                            }
                        } catch (e) {
                            throw new FS.ErrnoError(29)
                        }
                        if (length) {
                            stream.node.mtime = stream.node.ctime = Date.now()
                        }
                        return i
                    }
                },
                default_tty_ops: {
                    get_char(tty) {
                        return FS_stdin_getChar()
                    },
                    put_char(tty, val) {
                        if (val === null || val === 10) {
                            out(UTF8ArrayToString(tty.output));
                            tty.output = []
                        } else {
                            if (val != 0) tty.output.push(val)
                        }
                    },
                    fsync(tty) {
                        if (tty.output?.length > 0) {
                            out(UTF8ArrayToString(tty.output));
                            tty.output = []
                        }
                    },
                    ioctl_tcgets(tty) {
                        return {
                            c_iflag: 25856,
                            c_oflag: 5,
                            c_cflag: 191,
                            c_lflag: 35387,
                            c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        }
                    },
                    ioctl_tcsets(tty, optional_actions, data) {
                        return 0
                    },
                    ioctl_tiocgwinsz(tty) {
                        return [24, 80]
                    }
                },
                default_tty1_ops: {
                    put_char(tty, val) {
                        if (val === null || val === 10) {
                            err(UTF8ArrayToString(tty.output));
                            tty.output = []
                        } else {
                            if (val != 0) tty.output.push(val)
                        }
                    },
                    fsync(tty) {
                        if (tty.output?.length > 0) {
                            err(UTF8ArrayToString(tty.output));
                            tty.output = []
                        }
                    }
                }
            };
            var mmapAlloc = size => {
                abort()
            };
            var MEMFS = {
                ops_table: null,
                mount(mount) {
                    return MEMFS.createNode(null, "/", 16895, 0)
                },
                createNode(parent, name, mode, dev) {
                    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
                        throw new FS.ErrnoError(63)
                    }
                    MEMFS.ops_table ||= {
                        dir: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr,
                                lookup: MEMFS.node_ops.lookup,
                                mknod: MEMFS.node_ops.mknod,
                                rename: MEMFS.node_ops.rename,
                                unlink: MEMFS.node_ops.unlink,
                                rmdir: MEMFS.node_ops.rmdir,
                                readdir: MEMFS.node_ops.readdir,
                                symlink: MEMFS.node_ops.symlink
                            },
                            stream: {
                                llseek: MEMFS.stream_ops.llseek
                            }
                        },
                        file: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr
                            },
                            stream: {
                                llseek: MEMFS.stream_ops.llseek,
                                read: MEMFS.stream_ops.read,
                                write: MEMFS.stream_ops.write,
                                mmap: MEMFS.stream_ops.mmap,
                                msync: MEMFS.stream_ops.msync
                            }
                        },
                        link: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr,
                                readlink: MEMFS.node_ops.readlink
                            },
                            stream: {}
                        },
                        chrdev: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr
                            },
                            stream: FS.chrdev_stream_ops
                        }
                    };
                    var node = FS.createNode(parent, name, mode, dev);
                    if (FS.isDir(node.mode)) {
                        node.node_ops = MEMFS.ops_table.dir.node;
                        node.stream_ops = MEMFS.ops_table.dir.stream;
                        node.contents = {}
                    } else if (FS.isFile(node.mode)) {
                        node.node_ops = MEMFS.ops_table.file.node;
                        node.stream_ops = MEMFS.ops_table.file.stream;
                        node.usedBytes = 0;
                        node.contents = null
                    } else if (FS.isLink(node.mode)) {
                        node.node_ops = MEMFS.ops_table.link.node;
                        node.stream_ops = MEMFS.ops_table.link.stream
                    } else if (FS.isChrdev(node.mode)) {
                        node.node_ops = MEMFS.ops_table.chrdev.node;
                        node.stream_ops = MEMFS.ops_table.chrdev.stream
                    }
                    node.atime = node.mtime = node.ctime = Date.now();
                    if (parent) {
                        parent.contents[name] = node;
                        parent.atime = parent.mtime = parent.ctime = node.atime
                    }
                    return node
                },
                getFileDataAsTypedArray(node) {
                    if (!node.contents) return new Uint8Array(0);
                    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
                    return new Uint8Array(node.contents)
                },
                expandFileStorage(node, newCapacity) {
                    var prevCapacity = node.contents ? node.contents.length : 0;
                    if (prevCapacity >= newCapacity) return;
                    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
                    newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
                    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
                    var oldContents = node.contents;
                    node.contents = new Uint8Array(newCapacity);
                    if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
                },
                resizeFileStorage(node, newSize) {
                    if (node.usedBytes == newSize) return;
                    if (newSize == 0) {
                        node.contents = null;
                        node.usedBytes = 0
                    } else {
                        var oldContents = node.contents;
                        node.contents = new Uint8Array(newSize);
                        if (oldContents) {
                            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
                        }
                        node.usedBytes = newSize
                    }
                },
                node_ops: {
                    getattr(node) {
                        var attr = {};
                        attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
                        attr.ino = node.id;
                        attr.mode = node.mode;
                        attr.nlink = 1;
                        attr.uid = 0;
                        attr.gid = 0;
                        attr.rdev = node.rdev;
                        if (FS.isDir(node.mode)) {
                            attr.size = 4096
                        } else if (FS.isFile(node.mode)) {
                            attr.size = node.usedBytes
                        } else if (FS.isLink(node.mode)) {
                            attr.size = node.link.length
                        } else {
                            attr.size = 0
                        }
                        attr.atime = new Date(node.atime);
                        attr.mtime = new Date(node.mtime);
                        attr.ctime = new Date(node.ctime);
                        attr.blksize = 4096;
                        attr.blocks = Math.ceil(attr.size / attr.blksize);
                        return attr
                    },
                    setattr(node, attr) {
                        for (const key of ["mode", "atime", "mtime", "ctime"]) {
                            if (attr[key] != null) {
                                node[key] = attr[key]
                            }
                        }
                        if (attr.size !== undefined) {
                            MEMFS.resizeFileStorage(node, attr.size)
                        }
                    },
                    lookup(parent, name) {
                        throw MEMFS.doesNotExistError
                    },
                    mknod(parent, name, mode, dev) {
                        return MEMFS.createNode(parent, name, mode, dev)
                    },
                    rename(old_node, new_dir, new_name) {
                        var new_node;
                        try {
                            new_node = FS.lookupNode(new_dir, new_name)
                        } catch (e) {}
                        if (new_node) {
                            if (FS.isDir(old_node.mode)) {
                                for (var i in new_node.contents) {
                                    throw new FS.ErrnoError(55)
                                }
                            }
                            FS.hashRemoveNode(new_node)
                        }
                        delete old_node.parent.contents[old_node.name];
                        new_dir.contents[new_name] = old_node;
                        old_node.name = new_name;
                        new_dir.ctime = new_dir.mtime = old_node.parent.ctime = old_node.parent.mtime = Date.now()
                    },
                    unlink(parent, name) {
                        delete parent.contents[name];
                        parent.ctime = parent.mtime = Date.now()
                    },
                    rmdir(parent, name) {
                        var node = FS.lookupNode(parent, name);
                        for (var i in node.contents) {
                            throw new FS.ErrnoError(55)
                        }
                        delete parent.contents[name];
                        parent.ctime = parent.mtime = Date.now()
                    },
                    readdir(node) {
                        return [".", "..", ...Object.keys(node.contents)]
                    },
                    symlink(parent, newname, oldpath) {
                        var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
                        node.link = oldpath;
                        return node
                    },
                    readlink(node) {
                        if (!FS.isLink(node.mode)) {
                            throw new FS.ErrnoError(28)
                        }
                        return node.link
                    }
                },
                stream_ops: {
                    read(stream, buffer, offset, length, position) {
                        var contents = stream.node.contents;
                        if (position >= stream.node.usedBytes) return 0;
                        var size = Math.min(stream.node.usedBytes - position, length);
                        if (size > 8 && contents.subarray) {
                            buffer.set(contents.subarray(position, position + size), offset)
                        } else {
                            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
                        }
                        return size
                    },
                    write(stream, buffer, offset, length, position, canOwn) {
                        if (buffer.buffer === HEAP8.buffer) {
                            canOwn = false
                        }
                        if (!length) return 0;
                        var node = stream.node;
                        node.mtime = node.ctime = Date.now();
                        if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                            if (canOwn) {
                                node.contents = buffer.subarray(offset, offset + length);
                                node.usedBytes = length;
                                return length
                            } else if (node.usedBytes === 0 && position === 0) {
                                node.contents = buffer.slice(offset, offset + length);
                                node.usedBytes = length;
                                return length
                            } else if (position + length <= node.usedBytes) {
                                node.contents.set(buffer.subarray(offset, offset + length), position);
                                return length
                            }
                        }
                        MEMFS.expandFileStorage(node, position + length);
                        if (node.contents.subarray && buffer.subarray) {
                            node.contents.set(buffer.subarray(offset, offset + length), position)
                        } else {
                            for (var i = 0; i < length; i++) {
                                node.contents[position + i] = buffer[offset + i]
                            }
                        }
                        node.usedBytes = Math.max(node.usedBytes, position + length);
                        return length
                    },
                    llseek(stream, offset, whence) {
                        var position = offset;
                        if (whence === 1) {
                            position += stream.position
                        } else if (whence === 2) {
                            if (FS.isFile(stream.node.mode)) {
                                position += stream.node.usedBytes
                            }
                        }
                        if (position < 0) {
                            throw new FS.ErrnoError(28)
                        }
                        return position
                    },
                    mmap(stream, length, position, prot, flags) {
                        if (!FS.isFile(stream.node.mode)) {
                            throw new FS.ErrnoError(43)
                        }
                        var ptr;
                        var allocated;
                        var contents = stream.node.contents;
                        if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
                            allocated = false;
                            ptr = contents.byteOffset
                        } else {
                            allocated = true;
                            ptr = mmapAlloc(length);
                            if (!ptr) {
                                throw new FS.ErrnoError(48)
                            }
                            if (contents) {
                                if (position > 0 || position + length < contents.length) {
                                    if (contents.subarray) {
                                        contents = contents.subarray(position, position + length)
                                    } else {
                                        contents = Array.prototype.slice.call(contents, position, position + length)
                                    }
                                }
                                HEAP8.set(contents, ptr)
                            }
                        }
                        return {
                            ptr,
                            allocated
                        }
                    },
                    msync(stream, buffer, offset, length, mmapFlags) {
                        MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
                        return 0
                    }
                }
            };
            var asyncLoad = async url => {
                var arrayBuffer = await readAsync(url);
                return new Uint8Array(arrayBuffer)
            };
            var FS_createDataFile = (...args) => FS.createDataFile(...args);
            var getUniqueRunDependency = id => id;
            var preloadPlugins = [];
            var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
                if (typeof Browser != "undefined") Browser.init();
                var handled = false;
                preloadPlugins.forEach(plugin => {
                    if (handled) return;
                    if (plugin["canHandle"](fullname)) {
                        plugin["handle"](byteArray, fullname, finish, onerror);
                        handled = true
                    }
                });
                return handled
            };
            var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
                var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
                var dep = getUniqueRunDependency(`cp ${fullname}`);

                function processData(byteArray) {
                    function finish(byteArray) {
                        preFinish?.();
                        if (!dontCreateFile) {
                            FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                        }
                        onload?.();
                        removeRunDependency(dep)
                    }
                    if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
                            onerror?.();
                            removeRunDependency(dep)
                        })) {
                        return
                    }
                    finish(byteArray)
                }
                addRunDependency(dep);
                if (typeof url == "string") {
                    asyncLoad(url).then(processData, onerror)
                } else {
                    processData(url)
                }
            };
            var FS_modeStringToFlags = str => {
                var flagModes = {
                    r: 0,
                    "r+": 2,
                    w: 512 | 64 | 1,
                    "w+": 512 | 64 | 2,
                    a: 1024 | 64 | 1,
                    "a+": 1024 | 64 | 2
                };
                var flags = flagModes[str];
                if (typeof flags == "undefined") {
                    throw new Error(`Unknown file open mode: ${str}`)
                }
                return flags
            };
            var FS_getMode = (canRead, canWrite) => {
                var mode = 0;
                if (canRead) mode |= 292 | 73;
                if (canWrite) mode |= 146;
                return mode
            };
            var ERRNO_CODES = {
                EPERM: 63,
                ENOENT: 44,
                ESRCH: 71,
                EINTR: 27,
                EIO: 29,
                ENXIO: 60,
                E2BIG: 1,
                ENOEXEC: 45,
                EBADF: 8,
                ECHILD: 12,
                EAGAIN: 6,
                EWOULDBLOCK: 6,
                ENOMEM: 48,
                EACCES: 2,
                EFAULT: 21,
                ENOTBLK: 105,
                EBUSY: 10,
                EEXIST: 20,
                EXDEV: 75,
                ENODEV: 43,
                ENOTDIR: 54,
                EISDIR: 31,
                EINVAL: 28,
                ENFILE: 41,
                EMFILE: 33,
                ENOTTY: 59,
                ETXTBSY: 74,
                EFBIG: 22,
                ENOSPC: 51,
                ESPIPE: 70,
                EROFS: 69,
                EMLINK: 34,
                EPIPE: 64,
                EDOM: 18,
                ERANGE: 68,
                ENOMSG: 49,
                EIDRM: 24,
                ECHRNG: 106,
                EL2NSYNC: 156,
                EL3HLT: 107,
                EL3RST: 108,
                ELNRNG: 109,
                EUNATCH: 110,
                ENOCSI: 111,
                EL2HLT: 112,
                EDEADLK: 16,
                ENOLCK: 46,
                EBADE: 113,
                EBADR: 114,
                EXFULL: 115,
                ENOANO: 104,
                EBADRQC: 103,
                EBADSLT: 102,
                EDEADLOCK: 16,
                EBFONT: 101,
                ENOSTR: 100,
                ENODATA: 116,
                ETIME: 117,
                ENOSR: 118,
                ENONET: 119,
                ENOPKG: 120,
                EREMOTE: 121,
                ENOLINK: 47,
                EADV: 122,
                ESRMNT: 123,
                ECOMM: 124,
                EPROTO: 65,
                EMULTIHOP: 36,
                EDOTDOT: 125,
                EBADMSG: 9,
                ENOTUNIQ: 126,
                EBADFD: 127,
                EREMCHG: 128,
                ELIBACC: 129,
                ELIBBAD: 130,
                ELIBSCN: 131,
                ELIBMAX: 132,
                ELIBEXEC: 133,
                ENOSYS: 52,
                ENOTEMPTY: 55,
                ENAMETOOLONG: 37,
                ELOOP: 32,
                EOPNOTSUPP: 138,
                EPFNOSUPPORT: 139,
                ECONNRESET: 15,
                ENOBUFS: 42,
                EAFNOSUPPORT: 5,
                EPROTOTYPE: 67,
                ENOTSOCK: 57,
                ENOPROTOOPT: 50,
                ESHUTDOWN: 140,
                ECONNREFUSED: 14,
                EADDRINUSE: 3,
                ECONNABORTED: 13,
                ENETUNREACH: 40,
                ENETDOWN: 38,
                ETIMEDOUT: 73,
                EHOSTDOWN: 142,
                EHOSTUNREACH: 23,
                EINPROGRESS: 26,
                EALREADY: 7,
                EDESTADDRREQ: 17,
                EMSGSIZE: 35,
                EPROTONOSUPPORT: 66,
                ESOCKTNOSUPPORT: 137,
                EADDRNOTAVAIL: 4,
                ENETRESET: 39,
                EISCONN: 30,
                ENOTCONN: 53,
                ETOOMANYREFS: 141,
                EUSERS: 136,
                EDQUOT: 19,
                ESTALE: 72,
                ENOTSUP: 138,
                ENOMEDIUM: 148,
                EILSEQ: 25,
                EOVERFLOW: 61,
                ECANCELED: 11,
                ENOTRECOVERABLE: 56,
                EOWNERDEAD: 62,
                ESTRPIPE: 135
            };
            var NODEFS = {
                isWindows: false,
                staticInit() {
                    NODEFS.isWindows = !!process.platform.match(/^win/);
                    var flags = process.binding("constants")["fs"];
                    NODEFS.flagsForNodeMap = {
                        1024: flags["O_APPEND"],
                        64: flags["O_CREAT"],
                        128: flags["O_EXCL"],
                        256: flags["O_NOCTTY"],
                        0: flags["O_RDONLY"],
                        2: flags["O_RDWR"],
                        4096: flags["O_SYNC"],
                        512: flags["O_TRUNC"],
                        1: flags["O_WRONLY"],
                        131072: flags["O_NOFOLLOW"]
                    }
                },
                convertNodeCode(e) {
                    var code = e.code;
                    return ERRNO_CODES[code]
                },
                tryFSOperation(f) {
                    try {
                        return f()
                    } catch (e) {
                        if (!e.code) throw e;
                        if (e.code === "UNKNOWN") throw new FS.ErrnoError(28);
                        throw new FS.ErrnoError(NODEFS.convertNodeCode(e))
                    }
                },
                mount(mount) {
                    return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0)
                },
                createNode(parent, name, mode, dev) {
                    if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
                        throw new FS.ErrnoError(28)
                    }
                    var node = FS.createNode(parent, name, mode);
                    node.node_ops = NODEFS.node_ops;
                    node.stream_ops = NODEFS.stream_ops;
                    return node
                },
                getMode(path) {
                    return NODEFS.tryFSOperation(() => {
                        var mode = fs.lstatSync(path).mode;
                        if (NODEFS.isWindows) {
                            mode |= (mode & 292) >> 2
                        }
                        return mode
                    })
                },
                realPath(node) {
                    var parts = [];
                    while (node.parent !== node) {
                        parts.push(node.name);
                        node = node.parent
                    }
                    parts.push(node.mount.opts.root);
                    parts.reverse();
                    return PATH.join(...parts)
                },
                flagsForNode(flags) {
                    flags &= ~2097152;
                    flags &= ~2048;
                    flags &= ~32768;
                    flags &= ~524288;
                    flags &= ~65536;
                    var newFlags = 0;
                    for (var k in NODEFS.flagsForNodeMap) {
                        if (flags & k) {
                            newFlags |= NODEFS.flagsForNodeMap[k];
                            flags ^= k
                        }
                    }
                    if (flags) {
                        throw new FS.ErrnoError(28)
                    }
                    return newFlags
                },
                getattr(func, node) {
                    var stat = NODEFS.tryFSOperation(func);
                    if (NODEFS.isWindows) {
                        if (!stat.blksize) {
                            stat.blksize = 4096
                        }
                        if (!stat.blocks) {
                            stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0
                        }
                        stat.mode |= (stat.mode & 292) >> 2
                    }
                    return {
                        dev: stat.dev,
                        ino: node.id,
                        mode: stat.mode,
                        nlink: stat.nlink,
                        uid: stat.uid,
                        gid: stat.gid,
                        rdev: stat.rdev,
                        size: stat.size,
                        atime: stat.atime,
                        mtime: stat.mtime,
                        ctime: stat.ctime,
                        blksize: stat.blksize,
                        blocks: stat.blocks
                    }
                },
                setattr(arg, node, attr, chmod, utimes, truncate, stat) {
                    NODEFS.tryFSOperation(() => {
                        if (attr.mode !== undefined) {
                            var mode = attr.mode;
                            if (NODEFS.isWindows) {
                                mode &= 384
                            }
                            chmod(arg, mode);
                            node.mode = attr.mode
                        }
                        if (typeof(attr.atime ?? attr.mtime) === "number") {
                            var atime = new Date(attr.atime ?? stat(arg).atime);
                            var mtime = new Date(attr.mtime ?? stat(arg).mtime);
                            utimes(arg, atime, mtime)
                        }
                        if (attr.size !== undefined) {
                            truncate(arg, attr.size)
                        }
                    })
                },
                node_ops: {
                    getattr(node) {
                        var path = NODEFS.realPath(node);
                        return NODEFS.getattr(() => fs.lstatSync(path), node)
                    },
                    setattr(node, attr) {
                        var path = NODEFS.realPath(node);
                        if (attr.mode != null && attr.dontFollow) {
                            throw new FS.ErrnoError(52)
                        }
                        NODEFS.setattr(path, node, attr, fs.chmodSync, fs.utimesSync, fs.truncateSync, fs.lstatSync)
                    },
                    lookup(parent, name) {
                        var path = PATH.join2(NODEFS.realPath(parent), name);
                        var mode = NODEFS.getMode(path);
                        return NODEFS.createNode(parent, name, mode)
                    },
                    mknod(parent, name, mode, dev) {
                        var node = NODEFS.createNode(parent, name, mode, dev);
                        var path = NODEFS.realPath(node);
                        NODEFS.tryFSOperation(() => {
                            if (FS.isDir(node.mode)) {
                                fs.mkdirSync(path, node.mode)
                            } else {
                                fs.writeFileSync(path, "", {
                                    mode: node.mode
                                })
                            }
                        });
                        return node
                    },
                    rename(oldNode, newDir, newName) {
                        var oldPath = NODEFS.realPath(oldNode);
                        var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
                        try {
                            FS.unlink(newPath)
                        } catch (e) {}
                        NODEFS.tryFSOperation(() => fs.renameSync(oldPath, newPath));
                        oldNode.name = newName
                    },
                    unlink(parent, name) {
                        var path = PATH.join2(NODEFS.realPath(parent), name);
                        NODEFS.tryFSOperation(() => fs.unlinkSync(path))
                    },
                    rmdir(parent, name) {
                        var path = PATH.join2(NODEFS.realPath(parent), name);
                        NODEFS.tryFSOperation(() => fs.rmdirSync(path))
                    },
                    readdir(node) {
                        var path = NODEFS.realPath(node);
                        return NODEFS.tryFSOperation(() => fs.readdirSync(path))
                    },
                    symlink(parent, newName, oldPath) {
                        var newPath = PATH.join2(NODEFS.realPath(parent), newName);
                        NODEFS.tryFSOperation(() => fs.symlinkSync(oldPath, newPath))
                    },
                    readlink(node) {
                        var path = NODEFS.realPath(node);
                        return NODEFS.tryFSOperation(() => fs.readlinkSync(path))
                    },
                    statfs(path) {
                        var stats = NODEFS.tryFSOperation(() => fs.statfsSync(path));
                        stats.frsize = stats.bsize;
                        return stats
                    }
                },
                stream_ops: {
                    getattr(stream) {
                        return NODEFS.getattr(() => fs.fstatSync(stream.nfd), stream.node)
                    },
                    setattr(stream, attr) {
                        NODEFS.setattr(stream.nfd, stream.node, attr, fs.fchmodSync, fs.futimesSync, fs.ftruncateSync, fs.fstatSync)
                    },
                    open(stream) {
                        var path = NODEFS.realPath(stream.node);
                        NODEFS.tryFSOperation(() => {
                            stream.shared.refcount = 1;
                            stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags))
                        })
                    },
                    close(stream) {
                        NODEFS.tryFSOperation(() => {
                            if (stream.nfd && --stream.shared.refcount === 0) {
                                fs.closeSync(stream.nfd)
                            }
                        })
                    },
                    dup(stream) {
                        stream.shared.refcount++
                    },
                    read(stream, buffer, offset, length, position) {
                        return NODEFS.tryFSOperation(() => fs.readSync(stream.nfd, new Int8Array(buffer.buffer, offset, length), 0, length, position))
                    },
                    write(stream, buffer, offset, length, position) {
                        return NODEFS.tryFSOperation(() => fs.writeSync(stream.nfd, new Int8Array(buffer.buffer, offset, length), 0, length, position))
                    },
                    llseek(stream, offset, whence) {
                        var position = offset;
                        if (whence === 1) {
                            position += stream.position
                        } else if (whence === 2) {
                            if (FS.isFile(stream.node.mode)) {
                                NODEFS.tryFSOperation(() => {
                                    var stat = fs.fstatSync(stream.nfd);
                                    position += stat.size
                                })
                            }
                        }
                        if (position < 0) {
                            throw new FS.ErrnoError(28)
                        }
                        return position
                    },
                    mmap(stream, length, position, prot, flags) {
                        if (!FS.isFile(stream.node.mode)) {
                            throw new FS.ErrnoError(43)
                        }
                        var ptr = mmapAlloc(length);
                        NODEFS.stream_ops.read(stream, HEAP8, ptr, length, position);
                        return {
                            ptr,
                            allocated: true
                        }
                    },
                    msync(stream, buffer, offset, length, mmapFlags) {
                        NODEFS.stream_ops.write(stream, buffer, 0, length, offset, false);
                        return 0
                    }
                }
            };
            var WORKERFS = {
                DIR_MODE: 16895,
                FILE_MODE: 33279,
                reader: null,
                mount(mount) {
                    assert(ENVIRONMENT_IS_WORKER);
                    WORKERFS.reader ??= new FileReaderSync;
                    var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
                    var createdParents = {};

                    function ensureParent(path) {
                        var parts = path.split("/");
                        var parent = root;
                        for (var i = 0; i < parts.length - 1; i++) {
                            var curr = parts.slice(0, i + 1).join("/");
                            createdParents[curr] ||= WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0);
                            parent = createdParents[curr]
                        }
                        return parent
                    }

                    function base(path) {
                        var parts = path.split("/");
                        return parts[parts.length - 1]
                    }
                    Array.prototype.forEach.call(mount.opts["files"] || [], function(file) {
                        WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate)
                    });
                    (mount.opts["blobs"] || []).forEach(obj => {
                        WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"])
                    });
                    (mount.opts["packages"] || []).forEach(pack => {
                        pack["metadata"].files.forEach(file => {
                            var name = file.filename.slice(1);
                            WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack["blob"].slice(file.start, file.end))
                        })
                    });
                    return root
                },
                createNode(parent, name, mode, dev, contents, mtime) {
                    var node = FS.createNode(parent, name, mode);
                    node.mode = mode;
                    node.node_ops = WORKERFS.node_ops;
                    node.stream_ops = WORKERFS.stream_ops;
                    node.atime = node.mtime = node.ctime = (mtime || new Date).getTime();
                    assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
                    if (mode === WORKERFS.FILE_MODE) {
                        node.size = contents.size;
                        node.contents = contents
                    } else {
                        node.size = 4096;
                        node.contents = {}
                    }
                    if (parent) {
                        parent.contents[name] = node
                    }
                    return node
                },
                node_ops: {
                    getattr(node) {
                        return {
                            dev: 1,
                            ino: node.id,
                            mode: node.mode,
                            nlink: 1,
                            uid: 0,
                            gid: 0,
                            rdev: 0,
                            size: node.size,
                            atime: new Date(node.atime),
                            mtime: new Date(node.mtime),
                            ctime: new Date(node.ctime),
                            blksize: 4096,
                            blocks: Math.ceil(node.size / 4096)
                        }
                    },
                    setattr(node, attr) {
                        for (const key of ["mode", "atime", "mtime", "ctime"]) {
                            if (attr[key] != null) {
                                node[key] = attr[key]
                            }
                        }
                    },
                    lookup(parent, name) {
                        throw new FS.ErrnoError(44)
                    },
                    mknod(parent, name, mode, dev) {
                        throw new FS.ErrnoError(63)
                    },
                    rename(oldNode, newDir, newName) {
                        throw new FS.ErrnoError(63)
                    },
                    unlink(parent, name) {
                        throw new FS.ErrnoError(63)
                    },
                    rmdir(parent, name) {
                        throw new FS.ErrnoError(63)
                    },
                    readdir(node) {
                        var entries = [".", ".."];
                        for (var key of Object.keys(node.contents)) {
                            entries.push(key)
                        }
                        return entries
                    },
                    symlink(parent, newName, oldPath) {
                        throw new FS.ErrnoError(63)
                    }
                },
                stream_ops: {
                    read(stream, buffer, offset, length, position) {
                        if (position >= stream.node.size) return 0;
                        var chunk = stream.node.contents.slice(position, position + length);
                        var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
                        buffer.set(new Uint8Array(ab), offset);
                        return chunk.size
                    },
                    write(stream, buffer, offset, length, position) {
                        throw new FS.ErrnoError(29)
                    },
                    llseek(stream, offset, whence) {
                        var position = offset;
                        if (whence === 1) {
                            position += stream.position
                        } else if (whence === 2) {
                            if (FS.isFile(stream.node.mode)) {
                                position += stream.node.size
                            }
                        }
                        if (position < 0) {
                            throw new FS.ErrnoError(28)
                        }
                        return position
                    }
                }
            };
            var FS = {
                root: null,
                mounts: [],
                devices: {},
                streams: [],
                nextInode: 1,
                nameTable: null,
                currentPath: "/",
                initialized: false,
                ignorePermissions: true,
                filesystems: null,
                syncFSRequests: 0,
                readFiles: {},
                ErrnoError: class {
                    name = "ErrnoError";
                    constructor(errno) {
                        this.errno = errno
                    }
                },
                FSStream: class {
                    shared = {};
                    get object() {
                        return this.node
                    }
                    set object(val) {
                        this.node = val
                    }
                    get isRead() {
                        return (this.flags & 2097155) !== 1
                    }
                    get isWrite() {
                        return (this.flags & 2097155) !== 0
                    }
                    get isAppend() {
                        return this.flags & 1024
                    }
                    get flags() {
                        return this.shared.flags
                    }
                    set flags(val) {
                        this.shared.flags = val
                    }
                    get position() {
                        return this.shared.position
                    }
                    set position(val) {
                        this.shared.position = val
                    }
                },
                FSNode: class {
                    node_ops = {};
                    stream_ops = {};
                    readMode = 292 | 73;
                    writeMode = 146;
                    mounted = null;
                    constructor(parent, name, mode, rdev) {
                        if (!parent) {
                            parent = this
                        }
                        this.parent = parent;
                        this.mount = parent.mount;
                        this.id = FS.nextInode++;
                        this.name = name;
                        this.mode = mode;
                        this.rdev = rdev;
                        this.atime = this.mtime = this.ctime = Date.now()
                    }
                    get read() {
                        return (this.mode & this.readMode) === this.readMode
                    }
                    set read(val) {
                        val ? this.mode |= this.readMode : this.mode &= ~this.readMode
                    }
                    get write() {
                        return (this.mode & this.writeMode) === this.writeMode
                    }
                    set write(val) {
                        val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode
                    }
                    get isFolder() {
                        return FS.isDir(this.mode)
                    }
                    get isDevice() {
                        return FS.isChrdev(this.mode)
                    }
                },
                lookupPath(path, opts = {}) {
                    if (!path) {
                        throw new FS.ErrnoError(44)
                    }
                    opts.follow_mount ??= true;
                    if (!PATH.isAbs(path)) {
                        path = FS.cwd() + "/" + path
                    }
                    linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
                        var parts = path.split("/").filter(p => !!p);
                        var current = FS.root;
                        var current_path = "/";
                        for (var i = 0; i < parts.length; i++) {
                            var islast = i === parts.length - 1;
                            if (islast && opts.parent) {
                                break
                            }
                            if (parts[i] === ".") {
                                continue
                            }
                            if (parts[i] === "..") {
                                current_path = PATH.dirname(current_path);
                                if (FS.isRoot(current)) {
                                    path = current_path + "/" + parts.slice(i + 1).join("/");
                                    continue linkloop
                                } else {
                                    current = current.parent
                                }
                                continue
                            }
                            current_path = PATH.join2(current_path, parts[i]);
                            try {
                                current = FS.lookupNode(current, parts[i])
                            } catch (e) {
                                if (e?.errno === 44 && islast && opts.noent_okay) {
                                    return {
                                        path: current_path
                                    }
                                }
                                throw e
                            }
                            if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
                                current = current.mounted.root
                            }
                            if (FS.isLink(current.mode) && (!islast || opts.follow)) {
                                if (!current.node_ops.readlink) {
                                    throw new FS.ErrnoError(52)
                                }
                                var link = current.node_ops.readlink(current);
                                if (!PATH.isAbs(link)) {
                                    link = PATH.dirname(current_path) + "/" + link
                                }
                                path = link + "/" + parts.slice(i + 1).join("/");
                                continue linkloop
                            }
                        }
                        return {
                            path: current_path,
                            node: current
                        }
                    }
                    throw new FS.ErrnoError(32)
                },
                getPath(node) {
                    var path;
                    while (true) {
                        if (FS.isRoot(node)) {
                            var mount = node.mount.mountpoint;
                            if (!path) return mount;
                            return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path
                        }
                        path = path ? `${node.name}/${path}` : node.name;
                        node = node.parent
                    }
                },
                hashName(parentid, name) {
                    var hash = 0;
                    for (var i = 0; i < name.length; i++) {
                        hash = (hash << 5) - hash + name.charCodeAt(i) | 0
                    }
                    return (parentid + hash >>> 0) % FS.nameTable.length
                },
                hashAddNode(node) {
                    var hash = FS.hashName(node.parent.id, node.name);
                    node.name_next = FS.nameTable[hash];
                    FS.nameTable[hash] = node
                },
                hashRemoveNode(node) {
                    var hash = FS.hashName(node.parent.id, node.name);
                    if (FS.nameTable[hash] === node) {
                        FS.nameTable[hash] = node.name_next
                    } else {
                        var current = FS.nameTable[hash];
                        while (current) {
                            if (current.name_next === node) {
                                current.name_next = node.name_next;
                                break
                            }
                            current = current.name_next
                        }
                    }
                },
                lookupNode(parent, name) {
                    var errCode = FS.mayLookup(parent);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    var hash = FS.hashName(parent.id, name);
                    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
                        var nodeName = node.name;
                        if (node.parent.id === parent.id && nodeName === name) {
                            return node
                        }
                    }
                    return FS.lookup(parent, name)
                },
                createNode(parent, name, mode, rdev) {
                    var node = new FS.FSNode(parent, name, mode, rdev);
                    FS.hashAddNode(node);
                    return node
                },
                destroyNode(node) {
                    FS.hashRemoveNode(node)
                },
                isRoot(node) {
                    return node === node.parent
                },
                isMountpoint(node) {
                    return !!node.mounted
                },
                isFile(mode) {
                    return (mode & 61440) === 32768
                },
                isDir(mode) {
                    return (mode & 61440) === 16384
                },
                isLink(mode) {
                    return (mode & 61440) === 40960
                },
                isChrdev(mode) {
                    return (mode & 61440) === 8192
                },
                isBlkdev(mode) {
                    return (mode & 61440) === 24576
                },
                isFIFO(mode) {
                    return (mode & 61440) === 4096
                },
                isSocket(mode) {
                    return (mode & 49152) === 49152
                },
                flagsToPermissionString(flag) {
                    var perms = ["r", "w", "rw"][flag & 3];
                    if (flag & 512) {
                        perms += "w"
                    }
                    return perms
                },
                nodePermissions(node, perms) {
                    if (FS.ignorePermissions) {
                        return 0
                    }
                    if (perms.includes("r") && !(node.mode & 292)) {
                        return 2
                    } else if (perms.includes("w") && !(node.mode & 146)) {
                        return 2
                    } else if (perms.includes("x") && !(node.mode & 73)) {
                        return 2
                    }
                    return 0
                },
                mayLookup(dir) {
                    if (!FS.isDir(dir.mode)) return 54;
                    var errCode = FS.nodePermissions(dir, "x");
                    if (errCode) return errCode;
                    if (!dir.node_ops.lookup) return 2;
                    return 0
                },
                mayCreate(dir, name) {
                    if (!FS.isDir(dir.mode)) {
                        return 54
                    }
                    try {
                        var node = FS.lookupNode(dir, name);
                        return 20
                    } catch (e) {}
                    return FS.nodePermissions(dir, "wx")
                },
                mayDelete(dir, name, isdir) {
                    var node;
                    try {
                        node = FS.lookupNode(dir, name)
                    } catch (e) {
                        return e.errno
                    }
                    var errCode = FS.nodePermissions(dir, "wx");
                    if (errCode) {
                        return errCode
                    }
                    if (isdir) {
                        if (!FS.isDir(node.mode)) {
                            return 54
                        }
                        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                            return 10
                        }
                    } else {
                        if (FS.isDir(node.mode)) {
                            return 31
                        }
                    }
                    return 0
                },
                mayOpen(node, flags) {
                    if (!node) {
                        return 44
                    }
                    if (FS.isLink(node.mode)) {
                        return 32
                    } else if (FS.isDir(node.mode)) {
                        if (FS.flagsToPermissionString(flags) !== "r" || flags & (512 | 64)) {
                            return 31
                        }
                    }
                    return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
                },
                checkOpExists(op, err) {
                    if (!op) {
                        throw new FS.ErrnoError(err)
                    }
                    return op
                },
                MAX_OPEN_FDS: 4096,
                nextfd() {
                    for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
                        if (!FS.streams[fd]) {
                            return fd
                        }
                    }
                    throw new FS.ErrnoError(33)
                },
                getStreamChecked(fd) {
                    var stream = FS.getStream(fd);
                    if (!stream) {
                        throw new FS.ErrnoError(8)
                    }
                    return stream
                },
                getStream: fd => FS.streams[fd],
                createStream(stream, fd = -1) {
                    stream = Object.assign(new FS.FSStream, stream);
                    if (fd == -1) {
                        fd = FS.nextfd()
                    }
                    stream.fd = fd;
                    FS.streams[fd] = stream;
                    return stream
                },
                closeStream(fd) {
                    FS.streams[fd] = null
                },
                dupStream(origStream, fd = -1) {
                    var stream = FS.createStream(origStream, fd);
                    stream.stream_ops?.dup?.(stream);
                    return stream
                },
                doSetAttr(stream, node, attr) {
                    var setattr = stream?.stream_ops.setattr;
                    var arg = setattr ? stream : node;
                    setattr ??= node.node_ops.setattr;
                    FS.checkOpExists(setattr, 63);
                    setattr(arg, attr)
                },
                chrdev_stream_ops: {
                    open(stream) {
                        var device = FS.getDevice(stream.node.rdev);
                        stream.stream_ops = device.stream_ops;
                        stream.stream_ops.open?.(stream)
                    },
                    llseek() {
                        throw new FS.ErrnoError(70)
                    }
                },
                major: dev => dev >> 8,
                minor: dev => dev & 255,
                makedev: (ma, mi) => ma << 8 | mi,
                registerDevice(dev, ops) {
                    FS.devices[dev] = {
                        stream_ops: ops
                    }
                },
                getDevice: dev => FS.devices[dev],
                getMounts(mount) {
                    var mounts = [];
                    var check = [mount];
                    while (check.length) {
                        var m = check.pop();
                        mounts.push(m);
                        check.push(...m.mounts)
                    }
                    return mounts
                },
                syncfs(populate, callback) {
                    if (typeof populate == "function") {
                        callback = populate;
                        populate = false
                    }
                    FS.syncFSRequests++;
                    if (FS.syncFSRequests > 1) {
                        err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`)
                    }
                    var mounts = FS.getMounts(FS.root.mount);
                    var completed = 0;

                    function doCallback(errCode) {
                        FS.syncFSRequests--;
                        return callback(errCode)
                    }

                    function done(errCode) {
                        if (errCode) {
                            if (!done.errored) {
                                done.errored = true;
                                return doCallback(errCode)
                            }
                            return
                        }
                        if (++completed >= mounts.length) {
                            doCallback(null)
                        }
                    }
                    mounts.forEach(mount => {
                        if (!mount.type.syncfs) {
                            return done(null)
                        }
                        mount.type.syncfs(mount, populate, done)
                    })
                },
                mount(type, opts, mountpoint) {
                    var root = mountpoint === "/";
                    var pseudo = !mountpoint;
                    var node;
                    if (root && FS.root) {
                        throw new FS.ErrnoError(10)
                    } else if (!root && !pseudo) {
                        var lookup = FS.lookupPath(mountpoint, {
                            follow_mount: false
                        });
                        mountpoint = lookup.path;
                        node = lookup.node;
                        if (FS.isMountpoint(node)) {
                            throw new FS.ErrnoError(10)
                        }
                        if (!FS.isDir(node.mode)) {
                            throw new FS.ErrnoError(54)
                        }
                    }
                    var mount = {
                        type,
                        opts,
                        mountpoint,
                        mounts: []
                    };
                    var mountRoot = type.mount(mount);
                    mountRoot.mount = mount;
                    mount.root = mountRoot;
                    if (root) {
                        FS.root = mountRoot
                    } else if (node) {
                        node.mounted = mount;
                        if (node.mount) {
                            node.mount.mounts.push(mount)
                        }
                    }
                    return mountRoot
                },
                unmount(mountpoint) {
                    var lookup = FS.lookupPath(mountpoint, {
                        follow_mount: false
                    });
                    if (!FS.isMountpoint(lookup.node)) {
                        throw new FS.ErrnoError(28)
                    }
                    var node = lookup.node;
                    var mount = node.mounted;
                    var mounts = FS.getMounts(mount);
                    Object.keys(FS.nameTable).forEach(hash => {
                        var current = FS.nameTable[hash];
                        while (current) {
                            var next = current.name_next;
                            if (mounts.includes(current.mount)) {
                                FS.destroyNode(current)
                            }
                            current = next
                        }
                    });
                    node.mounted = null;
                    var idx = node.mount.mounts.indexOf(mount);
                    node.mount.mounts.splice(idx, 1)
                },
                lookup(parent, name) {
                    return parent.node_ops.lookup(parent, name)
                },
                mknod(path, mode, dev) {
                    var lookup = FS.lookupPath(path, {
                        parent: true
                    });
                    var parent = lookup.node;
                    var name = PATH.basename(path);
                    if (!name) {
                        throw new FS.ErrnoError(28)
                    }
                    if (name === "." || name === "..") {
                        throw new FS.ErrnoError(20)
                    }
                    var errCode = FS.mayCreate(parent, name);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.mknod) {
                        throw new FS.ErrnoError(63)
                    }
                    return parent.node_ops.mknod(parent, name, mode, dev)
                },
                statfs(path) {
                    return FS.statfsNode(FS.lookupPath(path, {
                        follow: true
                    }).node)
                },
                statfsStream(stream) {
                    return FS.statfsNode(stream.node)
                },
                statfsNode(node) {
                    var rtn = {
                        bsize: 4096,
                        frsize: 4096,
                        blocks: 1e6,
                        bfree: 5e5,
                        bavail: 5e5,
                        files: FS.nextInode,
                        ffree: FS.nextInode - 1,
                        fsid: 42,
                        flags: 2,
                        namelen: 255
                    };
                    if (node.node_ops.statfs) {
                        Object.assign(rtn, node.node_ops.statfs(node.mount.opts.root))
                    }
                    return rtn
                },
                create(path, mode = 438) {
                    mode &= 4095;
                    mode |= 32768;
                    return FS.mknod(path, mode, 0)
                },
                mkdir(path, mode = 511) {
                    mode &= 511 | 512;
                    mode |= 16384;
                    return FS.mknod(path, mode, 0)
                },
                mkdirTree(path, mode) {
                    var dirs = path.split("/");
                    var d = "";
                    for (var dir of dirs) {
                        if (!dir) continue;
                        if (d || PATH.isAbs(path)) d += "/";
                        d += dir;
                        try {
                            FS.mkdir(d, mode)
                        } catch (e) {
                            if (e.errno != 20) throw e
                        }
                    }
                },
                mkdev(path, mode, dev) {
                    if (typeof dev == "undefined") {
                        dev = mode;
                        mode = 438
                    }
                    mode |= 8192;
                    return FS.mknod(path, mode, dev)
                },
                symlink(oldpath, newpath) {
                    if (!PATH_FS.resolve(oldpath)) {
                        throw new FS.ErrnoError(44)
                    }
                    var lookup = FS.lookupPath(newpath, {
                        parent: true
                    });
                    var parent = lookup.node;
                    if (!parent) {
                        throw new FS.ErrnoError(44)
                    }
                    var newname = PATH.basename(newpath);
                    var errCode = FS.mayCreate(parent, newname);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.symlink) {
                        throw new FS.ErrnoError(63)
                    }
                    return parent.node_ops.symlink(parent, newname, oldpath)
                },
                rename(old_path, new_path) {
                    var old_dirname = PATH.dirname(old_path);
                    var new_dirname = PATH.dirname(new_path);
                    var old_name = PATH.basename(old_path);
                    var new_name = PATH.basename(new_path);
                    var lookup, old_dir, new_dir;
                    lookup = FS.lookupPath(old_path, {
                        parent: true
                    });
                    old_dir = lookup.node;
                    lookup = FS.lookupPath(new_path, {
                        parent: true
                    });
                    new_dir = lookup.node;
                    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
                    if (old_dir.mount !== new_dir.mount) {
                        throw new FS.ErrnoError(75)
                    }
                    var old_node = FS.lookupNode(old_dir, old_name);
                    var relative = PATH_FS.relative(old_path, new_dirname);
                    if (relative.charAt(0) !== ".") {
                        throw new FS.ErrnoError(28)
                    }
                    relative = PATH_FS.relative(new_path, old_dirname);
                    if (relative.charAt(0) !== ".") {
                        throw new FS.ErrnoError(55)
                    }
                    var new_node;
                    try {
                        new_node = FS.lookupNode(new_dir, new_name)
                    } catch (e) {}
                    if (old_node === new_node) {
                        return
                    }
                    var isdir = FS.isDir(old_node.mode);
                    var errCode = FS.mayDelete(old_dir, old_name, isdir);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!old_dir.node_ops.rename) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
                        throw new FS.ErrnoError(10)
                    }
                    if (new_dir !== old_dir) {
                        errCode = FS.nodePermissions(old_dir, "w");
                        if (errCode) {
                            throw new FS.ErrnoError(errCode)
                        }
                    }
                    FS.hashRemoveNode(old_node);
                    try {
                        old_dir.node_ops.rename(old_node, new_dir, new_name);
                        old_node.parent = new_dir
                    } catch (e) {
                        throw e
                    } finally {
                        FS.hashAddNode(old_node)
                    }
                },
                rmdir(path) {
                    var lookup = FS.lookupPath(path, {
                        parent: true
                    });
                    var parent = lookup.node;
                    var name = PATH.basename(path);
                    var node = FS.lookupNode(parent, name);
                    var errCode = FS.mayDelete(parent, name, true);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.rmdir) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isMountpoint(node)) {
                        throw new FS.ErrnoError(10)
                    }
                    parent.node_ops.rmdir(parent, name);
                    FS.destroyNode(node)
                },
                readdir(path) {
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    var node = lookup.node;
                    var readdir = FS.checkOpExists(node.node_ops.readdir, 54);
                    return readdir(node)
                },
                unlink(path) {
                    var lookup = FS.lookupPath(path, {
                        parent: true
                    });
                    var parent = lookup.node;
                    if (!parent) {
                        throw new FS.ErrnoError(44)
                    }
                    var name = PATH.basename(path);
                    var node = FS.lookupNode(parent, name);
                    var errCode = FS.mayDelete(parent, name, false);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.unlink) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isMountpoint(node)) {
                        throw new FS.ErrnoError(10)
                    }
                    parent.node_ops.unlink(parent, name);
                    FS.destroyNode(node)
                },
                readlink(path) {
                    var lookup = FS.lookupPath(path);
                    var link = lookup.node;
                    if (!link) {
                        throw new FS.ErrnoError(44)
                    }
                    if (!link.node_ops.readlink) {
                        throw new FS.ErrnoError(28)
                    }
                    return link.node_ops.readlink(link)
                },
                stat(path, dontFollow) {
                    var lookup = FS.lookupPath(path, {
                        follow: !dontFollow
                    });
                    var node = lookup.node;
                    var getattr = FS.checkOpExists(node.node_ops.getattr, 63);
                    return getattr(node)
                },
                fstat(fd) {
                    var stream = FS.getStreamChecked(fd);
                    var node = stream.node;
                    var getattr = stream.stream_ops.getattr;
                    var arg = getattr ? stream : node;
                    getattr ??= node.node_ops.getattr;
                    FS.checkOpExists(getattr, 63);
                    return getattr(arg)
                },
                lstat(path) {
                    return FS.stat(path, true)
                },
                doChmod(stream, node, mode, dontFollow) {
                    FS.doSetAttr(stream, node, {
                        mode: mode & 4095 | node.mode & ~4095,
                        ctime: Date.now(),
                        dontFollow
                    })
                },
                chmod(path, mode, dontFollow) {
                    var node;
                    if (typeof path == "string") {
                        var lookup = FS.lookupPath(path, {
                            follow: !dontFollow
                        });
                        node = lookup.node
                    } else {
                        node = path
                    }
                    FS.doChmod(null, node, mode, dontFollow)
                },
                lchmod(path, mode) {
                    FS.chmod(path, mode, true)
                },
                fchmod(fd, mode) {
                    var stream = FS.getStreamChecked(fd);
                    FS.doChmod(stream, stream.node, mode, false)
                },
                doChown(stream, node, dontFollow) {
                    FS.doSetAttr(stream, node, {
                        timestamp: Date.now(),
                        dontFollow
                    })
                },
                chown(path, uid, gid, dontFollow) {
                    var node;
                    if (typeof path == "string") {
                        var lookup = FS.lookupPath(path, {
                            follow: !dontFollow
                        });
                        node = lookup.node
                    } else {
                        node = path
                    }
                    FS.doChown(null, node, dontFollow)
                },
                lchown(path, uid, gid) {
                    FS.chown(path, uid, gid, true)
                },
                fchown(fd, uid, gid) {
                    var stream = FS.getStreamChecked(fd);
                    FS.doChown(stream, stream.node, false)
                },
                doTruncate(stream, node, len) {
                    if (FS.isDir(node.mode)) {
                        throw new FS.ErrnoError(31)
                    }
                    if (!FS.isFile(node.mode)) {
                        throw new FS.ErrnoError(28)
                    }
                    var errCode = FS.nodePermissions(node, "w");
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    FS.doSetAttr(stream, node, {
                        size: len,
                        timestamp: Date.now()
                    })
                },
                truncate(path, len) {
                    if (len < 0) {
                        throw new FS.ErrnoError(28)
                    }
                    var node;
                    if (typeof path == "string") {
                        var lookup = FS.lookupPath(path, {
                            follow: true
                        });
                        node = lookup.node
                    } else {
                        node = path
                    }
                    FS.doTruncate(null, node, len)
                },
                ftruncate(fd, len) {
                    var stream = FS.getStreamChecked(fd);
                    if (len < 0 || (stream.flags & 2097155) === 0) {
                        throw new FS.ErrnoError(28)
                    }
                    FS.doTruncate(stream, stream.node, len)
                },
                utime(path, atime, mtime) {
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    var node = lookup.node;
                    var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
                    setattr(node, {
                        atime,
                        mtime
                    })
                },
                open(path, flags, mode = 438) {
                    if (path === "") {
                        throw new FS.ErrnoError(44)
                    }
                    flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
                    if (flags & 64) {
                        mode = mode & 4095 | 32768
                    } else {
                        mode = 0
                    }
                    var node;
                    var isDirPath;
                    if (typeof path == "object") {
                        node = path
                    } else {
                        isDirPath = path.endsWith("/");
                        var lookup = FS.lookupPath(path, {
                            follow: !(flags & 131072),
                            noent_okay: true
                        });
                        node = lookup.node;
                        path = lookup.path
                    }
                    var created = false;
                    if (flags & 64) {
                        if (node) {
                            if (flags & 128) {
                                throw new FS.ErrnoError(20)
                            }
                        } else if (isDirPath) {
                            throw new FS.ErrnoError(31)
                        } else {
                            node = FS.mknod(path, mode | 511, 0);
                            created = true
                        }
                    }
                    if (!node) {
                        throw new FS.ErrnoError(44)
                    }
                    if (FS.isChrdev(node.mode)) {
                        flags &= ~512
                    }
                    if (flags & 65536 && !FS.isDir(node.mode)) {
                        throw new FS.ErrnoError(54)
                    }
                    if (!created) {
                        var errCode = FS.mayOpen(node, flags);
                        if (errCode) {
                            throw new FS.ErrnoError(errCode)
                        }
                    }
                    if (flags & 512 && !created) {
                        FS.truncate(node, 0)
                    }
                    flags &= ~(128 | 512 | 131072);
                    var stream = FS.createStream({
                        node,
                        path: FS.getPath(node),
                        flags,
                        seekable: true,
                        position: 0,
                        stream_ops: node.stream_ops,
                        ungotten: [],
                        error: false
                    });
                    if (stream.stream_ops.open) {
                        stream.stream_ops.open(stream)
                    }
                    if (created) {
                        FS.chmod(node, mode & 511)
                    }
                    if (Module["logReadFiles"] && !(flags & 1)) {
                        if (!(path in FS.readFiles)) {
                            FS.readFiles[path] = 1
                        }
                    }
                    return stream
                },
                close(stream) {
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if (stream.getdents) stream.getdents = null;
                    try {
                        if (stream.stream_ops.close) {
                            stream.stream_ops.close(stream)
                        }
                    } catch (e) {
                        throw e
                    } finally {
                        FS.closeStream(stream.fd)
                    }
                    stream.fd = null
                },
                isClosed(stream) {
                    return stream.fd === null
                },
                llseek(stream, offset, whence) {
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if (!stream.seekable || !stream.stream_ops.llseek) {
                        throw new FS.ErrnoError(70)
                    }
                    if (whence != 0 && whence != 1 && whence != 2) {
                        throw new FS.ErrnoError(28)
                    }
                    stream.position = stream.stream_ops.llseek(stream, offset, whence);
                    stream.ungotten = [];
                    return stream.position
                },
                read(stream, buffer, offset, length, position) {
                    if (length < 0 || position < 0) {
                        throw new FS.ErrnoError(28)
                    }
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if ((stream.flags & 2097155) === 1) {
                        throw new FS.ErrnoError(8)
                    }
                    if (FS.isDir(stream.node.mode)) {
                        throw new FS.ErrnoError(31)
                    }
                    if (!stream.stream_ops.read) {
                        throw new FS.ErrnoError(28)
                    }
                    var seeking = typeof position != "undefined";
                    if (!seeking) {
                        position = stream.position
                    } else if (!stream.seekable) {
                        throw new FS.ErrnoError(70)
                    }
                    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
                    if (!seeking) stream.position += bytesRead;
                    return bytesRead
                },
                write(stream, buffer, offset, length, position, canOwn) {
                    if (length < 0 || position < 0) {
                        throw new FS.ErrnoError(28)
                    }
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if ((stream.flags & 2097155) === 0) {
                        throw new FS.ErrnoError(8)
                    }
                    if (FS.isDir(stream.node.mode)) {
                        throw new FS.ErrnoError(31)
                    }
                    if (!stream.stream_ops.write) {
                        throw new FS.ErrnoError(28)
                    }
                    if (stream.seekable && stream.flags & 1024) {
                        FS.llseek(stream, 0, 2)
                    }
                    var seeking = typeof position != "undefined";
                    if (!seeking) {
                        position = stream.position
                    } else if (!stream.seekable) {
                        throw new FS.ErrnoError(70)
                    }
                    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
                    if (!seeking) stream.position += bytesWritten;
                    return bytesWritten
                },
                mmap(stream, length, position, prot, flags) {
                    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
                        throw new FS.ErrnoError(2)
                    }
                    if ((stream.flags & 2097155) === 1) {
                        throw new FS.ErrnoError(2)
                    }
                    if (!stream.stream_ops.mmap) {
                        throw new FS.ErrnoError(43)
                    }
                    if (!length) {
                        throw new FS.ErrnoError(28)
                    }
                    return stream.stream_ops.mmap(stream, length, position, prot, flags)
                },
                msync(stream, buffer, offset, length, mmapFlags) {
                    if (!stream.stream_ops.msync) {
                        return 0
                    }
                    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
                },
                ioctl(stream, cmd, arg) {
                    if (!stream.stream_ops.ioctl) {
                        throw new FS.ErrnoError(59)
                    }
                    return stream.stream_ops.ioctl(stream, cmd, arg)
                },
                readFile(path, opts = {}) {
                    opts.flags = opts.flags || 0;
                    opts.encoding = opts.encoding || "binary";
                    if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
                        throw new Error(`Invalid encoding type "${opts.encoding}"`)
                    }
                    var stream = FS.open(path, opts.flags);
                    var stat = FS.stat(path);
                    var length = stat.size;
                    var buf = new Uint8Array(length);
                    FS.read(stream, buf, 0, length, 0);
                    if (opts.encoding === "utf8") {
                        buf = UTF8ArrayToString(buf)
                    }
                    FS.close(stream);
                    return buf
                },
                writeFile(path, data, opts = {}) {
                    opts.flags = opts.flags || 577;
                    var stream = FS.open(path, opts.flags, opts.mode);
                    if (typeof data == "string") {
                        data = new Uint8Array(intArrayFromString(data, true))
                    }
                    if (ArrayBuffer.isView(data)) {
                        FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
                    } else {
                        throw new Error("Unsupported data type")
                    }
                    FS.close(stream)
                },
                cwd: () => FS.currentPath,
                chdir(path) {
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    if (lookup.node === null) {
                        throw new FS.ErrnoError(44)
                    }
                    if (!FS.isDir(lookup.node.mode)) {
                        throw new FS.ErrnoError(54)
                    }
                    var errCode = FS.nodePermissions(lookup.node, "x");
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    FS.currentPath = lookup.path
                },
                createDefaultDirectories() {
                    FS.mkdir("/tmp");
                    FS.mkdir("/home");
                    FS.mkdir("/home/web_user")
                },
                createDefaultDevices() {
                    FS.mkdir("/dev");
                    FS.registerDevice(FS.makedev(1, 3), {
                        read: () => 0,
                        write: (stream, buffer, offset, length, pos) => length,
                        llseek: () => 0
                    });
                    FS.mkdev("/dev/null", FS.makedev(1, 3));
                    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
                    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
                    FS.mkdev("/dev/tty", FS.makedev(5, 0));
                    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
                    var randomBuffer = new Uint8Array(1024),
                        randomLeft = 0;
                    var randomByte = () => {
                        if (randomLeft === 0) {
                            randomFill(randomBuffer);
                            randomLeft = randomBuffer.byteLength
                        }
                        return randomBuffer[--randomLeft]
                    };
                    FS.createDevice("/dev", "random", randomByte);
                    FS.createDevice("/dev", "urandom", randomByte);
                    FS.mkdir("/dev/shm");
                    FS.mkdir("/dev/shm/tmp")
                },
                createSpecialDirectories() {
                    FS.mkdir("/proc");
                    var proc_self = FS.mkdir("/proc/self");
                    FS.mkdir("/proc/self/fd");
                    FS.mount({
                        mount() {
                            var node = FS.createNode(proc_self, "fd", 16895, 73);
                            node.stream_ops = {
                                llseek: MEMFS.stream_ops.llseek
                            };
                            node.node_ops = {
                                lookup(parent, name) {
                                    var fd = +name;
                                    var stream = FS.getStreamChecked(fd);
                                    var ret = {
                                        parent: null,
                                        mount: {
                                            mountpoint: "fake"
                                        },
                                        node_ops: {
                                            readlink: () => stream.path
                                        },
                                        id: fd + 1
                                    };
                                    ret.parent = ret;
                                    return ret
                                },
                                readdir() {
                                    return Array.from(FS.streams.entries()).filter(([k, v]) => v).map(([k, v]) => k.toString())
                                }
                            };
                            return node
                        }
                    }, {}, "/proc/self/fd")
                },
                createStandardStreams(input, output, error) {
                    if (input) {
                        FS.createDevice("/dev", "stdin", input)
                    } else {
                        FS.symlink("/dev/tty", "/dev/stdin")
                    }
                    if (output) {
                        FS.createDevice("/dev", "stdout", null, output)
                    } else {
                        FS.symlink("/dev/tty", "/dev/stdout")
                    }
                    if (error) {
                        FS.createDevice("/dev", "stderr", null, error)
                    } else {
                        FS.symlink("/dev/tty1", "/dev/stderr")
                    }
                    var stdin = FS.open("/dev/stdin", 0);
                    var stdout = FS.open("/dev/stdout", 1);
                    var stderr = FS.open("/dev/stderr", 1)
                },
                staticInit() {
                    FS.nameTable = new Array(4096);
                    FS.mount(MEMFS, {}, "/");
                    FS.createDefaultDirectories();
                    FS.createDefaultDevices();
                    FS.createSpecialDirectories();
                    FS.filesystems = {
                        MEMFS,
                        NODEFS,
                        WORKERFS
                    }
                },
                init(input, output, error) {
                    FS.initialized = true;
                    input ??= Module["stdin"];
                    output ??= Module["stdout"];
                    error ??= Module["stderr"];
                    FS.createStandardStreams(input, output, error)
                },
                quit() {
                    FS.initialized = false;
                    for (var stream of FS.streams) {
                        if (stream) {
                            FS.close(stream)
                        }
                    }
                },
                findObject(path, dontResolveLastLink) {
                    var ret = FS.analyzePath(path, dontResolveLastLink);
                    if (!ret.exists) {
                        return null
                    }
                    return ret.object
                },
                analyzePath(path, dontResolveLastLink) {
                    try {
                        var lookup = FS.lookupPath(path, {
                            follow: !dontResolveLastLink
                        });
                        path = lookup.path
                    } catch (e) {}
                    var ret = {
                        isRoot: false,
                        exists: false,
                        error: 0,
                        name: null,
                        path: null,
                        object: null,
                        parentExists: false,
                        parentPath: null,
                        parentObject: null
                    };
                    try {
                        var lookup = FS.lookupPath(path, {
                            parent: true
                        });
                        ret.parentExists = true;
                        ret.parentPath = lookup.path;
                        ret.parentObject = lookup.node;
                        ret.name = PATH.basename(path);
                        lookup = FS.lookupPath(path, {
                            follow: !dontResolveLastLink
                        });
                        ret.exists = true;
                        ret.path = lookup.path;
                        ret.object = lookup.node;
                        ret.name = lookup.node.name;
                        ret.isRoot = lookup.path === "/"
                    } catch (e) {
                        ret.error = e.errno
                    }
                    return ret
                },
                createPath(parent, path, canRead, canWrite) {
                    parent = typeof parent == "string" ? parent : FS.getPath(parent);
                    var parts = path.split("/").reverse();
                    while (parts.length) {
                        var part = parts.pop();
                        if (!part) continue;
                        var current = PATH.join2(parent, part);
                        try {
                            FS.mkdir(current)
                        } catch (e) {
                            if (e.errno != 20) throw e
                        }
                        parent = current
                    }
                    return current
                },
                createFile(parent, name, properties, canRead, canWrite) {
                    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
                    var mode = FS_getMode(canRead, canWrite);
                    return FS.create(path, mode)
                },
                createDataFile(parent, name, data, canRead, canWrite, canOwn) {
                    var path = name;
                    if (parent) {
                        parent = typeof parent == "string" ? parent : FS.getPath(parent);
                        path = name ? PATH.join2(parent, name) : parent
                    }
                    var mode = FS_getMode(canRead, canWrite);
                    var node = FS.create(path, mode);
                    if (data) {
                        if (typeof data == "string") {
                            var arr = new Array(data.length);
                            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                            data = arr
                        }
                        FS.chmod(node, mode | 146);
                        var stream = FS.open(node, 577);
                        FS.write(stream, data, 0, data.length, 0, canOwn);
                        FS.close(stream);
                        FS.chmod(node, mode)
                    }
                },
                createDevice(parent, name, input, output) {
                    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
                    var mode = FS_getMode(!!input, !!output);
                    FS.createDevice.major ??= 64;
                    var dev = FS.makedev(FS.createDevice.major++, 0);
                    FS.registerDevice(dev, {
                        open(stream) {
                            stream.seekable = false
                        },
                        close(stream) {
                            if (output?.buffer?.length) {
                                output(10)
                            }
                        },
                        read(stream, buffer, offset, length, pos) {
                            var bytesRead = 0;
                            for (var i = 0; i < length; i++) {
                                var result;
                                try {
                                    result = input()
                                } catch (e) {
                                    throw new FS.ErrnoError(29)
                                }
                                if (result === undefined && bytesRead === 0) {
                                    throw new FS.ErrnoError(6)
                                }
                                if (result === null || result === undefined) break;
                                bytesRead++;
                                buffer[offset + i] = result
                            }
                            if (bytesRead) {
                                stream.node.atime = Date.now()
                            }
                            return bytesRead
                        },
                        write(stream, buffer, offset, length, pos) {
                            for (var i = 0; i < length; i++) {
                                try {
                                    output(buffer[offset + i])
                                } catch (e) {
                                    throw new FS.ErrnoError(29)
                                }
                            }
                            if (length) {
                                stream.node.mtime = stream.node.ctime = Date.now()
                            }
                            return i
                        }
                    });
                    return FS.mkdev(path, mode, dev)
                },
                forceLoadFile(obj) {
                    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
                    if (typeof XMLHttpRequest != "undefined") {
                        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
                    } else {
                        try {
                            obj.contents = readBinary(obj.url);
                            obj.usedBytes = obj.contents.length
                        } catch (e) {
                            throw new FS.ErrnoError(29)
                        }
                    }
                },
                createLazyFile(parent, name, url, canRead, canWrite) {
                    class LazyUint8Array {
                        lengthKnown = false;
                        chunks = [];
                        get(idx) {
                            if (idx > this.length - 1 || idx < 0) {
                                return undefined
                            }
                            var chunkOffset = idx % this.chunkSize;
                            var chunkNum = idx / this.chunkSize | 0;
                            return this.getter(chunkNum)[chunkOffset]
                        }
                        setDataGetter(getter) {
                            this.getter = getter
                        }
                        cacheLength() {
                            var xhr = new XMLHttpRequest;
                            xhr.open("HEAD", url, false);
                            xhr.send(null);
                            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                            var datalength = Number(xhr.getResponseHeader("Content-length"));
                            var header;
                            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
                            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
                            var chunkSize = 1024 * 1024;
                            if (!hasByteServing) chunkSize = datalength;
                            var doXHR = (from, to) => {
                                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                                if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                                var xhr = new XMLHttpRequest;
                                xhr.open("GET", url, false);
                                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                                xhr.responseType = "arraybuffer";
                                if (xhr.overrideMimeType) {
                                    xhr.overrideMimeType("text/plain; charset=x-user-defined")
                                }
                                xhr.send(null);
                                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                                if (xhr.response !== undefined) {
                                    return new Uint8Array(xhr.response || [])
                                }
                                return intArrayFromString(xhr.responseText || "", true)
                            };
                            var lazyArray = this;
                            lazyArray.setDataGetter(chunkNum => {
                                var start = chunkNum * chunkSize;
                                var end = (chunkNum + 1) * chunkSize - 1;
                                end = Math.min(end, datalength - 1);
                                if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                                    lazyArray.chunks[chunkNum] = doXHR(start, end)
                                }
                                if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
                                return lazyArray.chunks[chunkNum]
                            });
                            if (usesGzip || !datalength) {
                                chunkSize = datalength = 1;
                                datalength = this.getter(0).length;
                                chunkSize = datalength;
                                out("LazyFiles on gzip forces download of the whole file when length is accessed")
                            }
                            this._length = datalength;
                            this._chunkSize = chunkSize;
                            this.lengthKnown = true
                        }
                        get length() {
                            if (!this.lengthKnown) {
                                this.cacheLength()
                            }
                            return this._length
                        }
                        get chunkSize() {
                            if (!this.lengthKnown) {
                                this.cacheLength()
                            }
                            return this._chunkSize
                        }
                    }
                    if (typeof XMLHttpRequest != "undefined") {
                        if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                        var lazyArray = new LazyUint8Array;
                        var properties = {
                            isDevice: false,
                            contents: lazyArray
                        }
                    } else {
                        var properties = {
                            isDevice: false,
                            url
                        }
                    }
                    var node = FS.createFile(parent, name, properties, canRead, canWrite);
                    if (properties.contents) {
                        node.contents = properties.contents
                    } else if (properties.url) {
                        node.contents = null;
                        node.url = properties.url
                    }
                    Object.defineProperties(node, {
                        usedBytes: {
                            get: function() {
                                return this.contents.length
                            }
                        }
                    });
                    var stream_ops = {};
                    var keys = Object.keys(node.stream_ops);
                    keys.forEach(key => {
                        var fn = node.stream_ops[key];
                        stream_ops[key] = (...args) => {
                            FS.forceLoadFile(node);
                            return fn(...args)
                        }
                    });

                    function writeChunks(stream, buffer, offset, length, position) {
                        var contents = stream.node.contents;
                        if (position >= contents.length) return 0;
                        var size = Math.min(contents.length - position, length);
                        if (contents.slice) {
                            for (var i = 0; i < size; i++) {
                                buffer[offset + i] = contents[position + i]
                            }
                        } else {
                            for (var i = 0; i < size; i++) {
                                buffer[offset + i] = contents.get(position + i)
                            }
                        }
                        return size
                    }
                    stream_ops.read = (stream, buffer, offset, length, position) => {
                        FS.forceLoadFile(node);
                        return writeChunks(stream, buffer, offset, length, position)
                    };
                    stream_ops.mmap = (stream, length, position, prot, flags) => {
                        FS.forceLoadFile(node);
                        var ptr = mmapAlloc(length);
                        if (!ptr) {
                            throw new FS.ErrnoError(48)
                        }
                        writeChunks(stream, HEAP8, ptr, length, position);
                        return {
                            ptr,
                            allocated: true
                        }
                    };
                    node.stream_ops = stream_ops;
                    return node
                }
            };
            var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
            var SYSCALLS = {
                DEFAULT_POLLMASK: 5,
                calculateAt(dirfd, path, allowEmpty) {
                    if (PATH.isAbs(path)) {
                        return path
                    }
                    var dir;
                    if (dirfd === -100) {
                        dir = FS.cwd()
                    } else {
                        var dirstream = SYSCALLS.getStreamFromFD(dirfd);
                        dir = dirstream.path
                    }
                    if (path.length == 0) {
                        if (!allowEmpty) {
                            throw new FS.ErrnoError(44)
                        }
                        return dir
                    }
                    return dir + "/" + path
                },
                writeStat(buf, stat) {
                    HEAP32[buf >> 2] = stat.dev;
                    HEAP32[buf + 4 >> 2] = stat.mode;
                    HEAPU32[buf + 8 >> 2] = stat.nlink;
                    HEAP32[buf + 12 >> 2] = stat.uid;
                    HEAP32[buf + 16 >> 2] = stat.gid;
                    HEAP32[buf + 20 >> 2] = stat.rdev;
                    HEAP64[buf + 24 >> 3] = BigInt(stat.size);
                    HEAP32[buf + 32 >> 2] = 4096;
                    HEAP32[buf + 36 >> 2] = stat.blocks;
                    var atime = stat.atime.getTime();
                    var mtime = stat.mtime.getTime();
                    var ctime = stat.ctime.getTime();
                    HEAP64[buf + 40 >> 3] = BigInt(Math.floor(atime / 1e3));
                    HEAPU32[buf + 48 >> 2] = atime % 1e3 * 1e3 * 1e3;
                    HEAP64[buf + 56 >> 3] = BigInt(Math.floor(mtime / 1e3));
                    HEAPU32[buf + 64 >> 2] = mtime % 1e3 * 1e3 * 1e3;
                    HEAP64[buf + 72 >> 3] = BigInt(Math.floor(ctime / 1e3));
                    HEAPU32[buf + 80 >> 2] = ctime % 1e3 * 1e3 * 1e3;
                    HEAP64[buf + 88 >> 3] = BigInt(stat.ino);
                    return 0
                },
                writeStatFs(buf, stats) {
                    HEAP32[buf + 4 >> 2] = stats.bsize;
                    HEAP32[buf + 40 >> 2] = stats.bsize;
                    HEAP32[buf + 8 >> 2] = stats.blocks;
                    HEAP32[buf + 12 >> 2] = stats.bfree;
                    HEAP32[buf + 16 >> 2] = stats.bavail;
                    HEAP32[buf + 20 >> 2] = stats.files;
                    HEAP32[buf + 24 >> 2] = stats.ffree;
                    HEAP32[buf + 28 >> 2] = stats.fsid;
                    HEAP32[buf + 44 >> 2] = stats.flags;
                    HEAP32[buf + 36 >> 2] = stats.namelen
                },
                doMsync(addr, stream, len, flags, offset) {
                    if (!FS.isFile(stream.node.mode)) {
                        throw new FS.ErrnoError(43)
                    }
                    if (flags & 2) {
                        return 0
                    }
                    var buffer = HEAPU8.slice(addr, addr + len);
                    FS.msync(stream, buffer, offset, len, flags)
                },
                getStreamFromFD(fd) {
                    var stream = FS.getStreamChecked(fd);
                    return stream
                },
                varargs: undefined,
                getStr(ptr) {
                    var ret = UTF8ToString(ptr);
                    return ret
                }
            };

            function ___syscall_chmod(path, mode) {
                try {
                    path = SYSCALLS.getStr(path);
                    FS.chmod(path, mode);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_fchownat(dirfd, path, owner, group, flags) {
                try {
                    path = SYSCALLS.getStr(path);
                    var nofollow = flags & 256;
                    flags = flags & ~256;
                    path = SYSCALLS.calculateAt(dirfd, path);
                    (nofollow ? FS.lchown : FS.chown)(path, owner, group);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_fstat64(fd, buf) {
                try {
                    return SYSCALLS.writeStat(buf, FS.fstat(fd))
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }
            var INT53_MAX = 9007199254740992;
            var INT53_MIN = -9007199254740992;
            var bigintToI53Checked = num => num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);

            function ___syscall_ftruncate64(fd, length) {
                length = bigintToI53Checked(length);
                try {
                    if (isNaN(length)) return -61;
                    FS.ftruncate(fd, length);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }
            var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);

            function ___syscall_getcwd(buf, size) {
                try {
                    if (size === 0) return -28;
                    var cwd = FS.cwd();
                    var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
                    if (size < cwdLengthInBytes) return -68;
                    stringToUTF8(cwd, buf, size);
                    return cwdLengthInBytes
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_getdents64(fd, dirp, count) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    stream.getdents ||= FS.readdir(stream.path);
                    var struct_size = 280;
                    var pos = 0;
                    var off = FS.llseek(stream, 0, 1);
                    var startIdx = Math.floor(off / struct_size);
                    var endIdx = Math.min(stream.getdents.length, startIdx + Math.floor(count / struct_size));
                    for (var idx = startIdx; idx < endIdx; idx++) {
                        var id;
                        var type;
                        var name = stream.getdents[idx];
                        if (name === ".") {
                            id = stream.node.id;
                            type = 4
                        } else if (name === "..") {
                            var lookup = FS.lookupPath(stream.path, {
                                parent: true
                            });
                            id = lookup.node.id;
                            type = 4
                        } else {
                            var child;
                            try {
                                child = FS.lookupNode(stream.node, name)
                            } catch (e) {
                                if (e?.errno === 28) {
                                    continue
                                }
                                throw e
                            }
                            id = child.id;
                            type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
                        }
                        HEAP64[dirp + pos >> 3] = BigInt(id);
                        HEAP64[dirp + pos + 8 >> 3] = BigInt((idx + 1) * struct_size);
                        HEAP16[dirp + pos + 16 >> 1] = 280;
                        HEAP8[dirp + pos + 18] = type;
                        stringToUTF8(name, dirp + pos + 19, 256);
                        pos += struct_size
                    }
                    FS.llseek(stream, idx * struct_size, 0);
                    return pos
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }
            var syscallGetVarargI = () => {
                var ret = HEAP32[+SYSCALLS.varargs >> 2];
                SYSCALLS.varargs += 4;
                return ret
            };
            var syscallGetVarargP = syscallGetVarargI;

            function ___syscall_ioctl(fd, op, varargs) {
                SYSCALLS.varargs = varargs;
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    switch (op) {
                        case 21509: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        case 21505: {
                            if (!stream.tty) return -59;
                            if (stream.tty.ops.ioctl_tcgets) {
                                var termios = stream.tty.ops.ioctl_tcgets(stream);
                                var argp = syscallGetVarargP();
                                HEAP32[argp >> 2] = termios.c_iflag || 0;
                                HEAP32[argp + 4 >> 2] = termios.c_oflag || 0;
                                HEAP32[argp + 8 >> 2] = termios.c_cflag || 0;
                                HEAP32[argp + 12 >> 2] = termios.c_lflag || 0;
                                for (var i = 0; i < 32; i++) {
                                    HEAP8[argp + i + 17] = termios.c_cc[i] || 0
                                }
                                return 0
                            }
                            return 0
                        }
                        case 21510:
                        case 21511:
                        case 21512: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        case 21506:
                        case 21507:
                        case 21508: {
                            if (!stream.tty) return -59;
                            if (stream.tty.ops.ioctl_tcsets) {
                                var argp = syscallGetVarargP();
                                var c_iflag = HEAP32[argp >> 2];
                                var c_oflag = HEAP32[argp + 4 >> 2];
                                var c_cflag = HEAP32[argp + 8 >> 2];
                                var c_lflag = HEAP32[argp + 12 >> 2];
                                var c_cc = [];
                                for (var i = 0; i < 32; i++) {
                                    c_cc.push(HEAP8[argp + i + 17])
                                }
                                return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
                                    c_iflag,
                                    c_oflag,
                                    c_cflag,
                                    c_lflag,
                                    c_cc
                                })
                            }
                            return 0
                        }
                        case 21519: {
                            if (!stream.tty) return -59;
                            var argp = syscallGetVarargP();
                            HEAP32[argp >> 2] = 0;
                            return 0
                        }
                        case 21520: {
                            if (!stream.tty) return -59;
                            return -28
                        }
                        case 21531: {
                            var argp = syscallGetVarargP();
                            return FS.ioctl(stream, op, argp)
                        }
                        case 21523: {
                            if (!stream.tty) return -59;
                            if (stream.tty.ops.ioctl_tiocgwinsz) {
                                var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
                                var argp = syscallGetVarargP();
                                HEAP16[argp >> 1] = winsize[0];
                                HEAP16[argp + 2 >> 1] = winsize[1]
                            }
                            return 0
                        }
                        case 21524: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        case 21515: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        default:
                            return -28
                    }
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_lstat64(path, buf) {
                try {
                    path = SYSCALLS.getStr(path);
                    return SYSCALLS.writeStat(buf, FS.lstat(path))
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_mkdirat(dirfd, path, mode) {
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path);
                    FS.mkdir(path, mode, 0);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_newfstatat(dirfd, path, buf, flags) {
                try {
                    path = SYSCALLS.getStr(path);
                    var nofollow = flags & 256;
                    var allowEmpty = flags & 4096;
                    flags = flags & ~6400;
                    path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
                    return SYSCALLS.writeStat(buf, nofollow ? FS.lstat(path) : FS.stat(path))
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_openat(dirfd, path, flags, varargs) {
                SYSCALLS.varargs = varargs;
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path);
                    var mode = varargs ? syscallGetVarargI() : 0;
                    return FS.open(path, flags, mode).fd
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path);
                    if (bufsize <= 0) return -28;
                    var ret = FS.readlink(path);
                    var len = Math.min(bufsize, lengthBytesUTF8(ret));
                    var endChar = HEAP8[buf + len];
                    stringToUTF8(ret, buf, bufsize + 1);
                    HEAP8[buf + len] = endChar;
                    return len
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
                try {
                    oldpath = SYSCALLS.getStr(oldpath);
                    newpath = SYSCALLS.getStr(newpath);
                    oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
                    newpath = SYSCALLS.calculateAt(newdirfd, newpath);
                    FS.rename(oldpath, newpath);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_rmdir(path) {
                try {
                    path = SYSCALLS.getStr(path);
                    FS.rmdir(path);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_stat64(path, buf) {
                try {
                    path = SYSCALLS.getStr(path);
                    return SYSCALLS.writeStat(buf, FS.stat(path))
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_symlinkat(target, dirfd, linkpath) {
                try {
                    target = SYSCALLS.getStr(target);
                    linkpath = SYSCALLS.getStr(linkpath);
                    linkpath = SYSCALLS.calculateAt(dirfd, linkpath);
                    FS.symlink(target, linkpath);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }

            function ___syscall_unlinkat(dirfd, path, flags) {
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path);
                    if (!flags) {
                        FS.unlink(path)
                    } else if (flags === 512) {
                        FS.rmdir(path)
                    } else {
                        return -28
                    }
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }
            var readI53FromI64 = ptr => HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296;

            function ___syscall_utimensat(dirfd, path, times, flags) {
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path, true);
                    var now = Date.now(),
                        atime, mtime;
                    if (!times) {
                        atime = now;
                        mtime = now
                    } else {
                        var seconds = readI53FromI64(times);
                        var nanoseconds = HEAP32[times + 8 >> 2];
                        if (nanoseconds == 1073741823) {
                            atime = now
                        } else if (nanoseconds == 1073741822) {
                            atime = null
                        } else {
                            atime = seconds * 1e3 + nanoseconds / (1e3 * 1e3)
                        }
                        times += 16;
                        seconds = readI53FromI64(times);
                        nanoseconds = HEAP32[times + 8 >> 2];
                        if (nanoseconds == 1073741823) {
                            mtime = now
                        } else if (nanoseconds == 1073741822) {
                            mtime = null
                        } else {
                            mtime = seconds * 1e3 + nanoseconds / (1e3 * 1e3)
                        }
                    }
                    if ((mtime ?? atime) !== null) {
                        FS.utime(path, atime, mtime)
                    }
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return -e.errno
                }
            }
            var __abort_js = () => abort("");

            function __gmtime_js(time, tmPtr) {
                time = bigintToI53Checked(time);
                var date = new Date(time * 1e3);
                HEAP32[tmPtr >> 2] = date.getUTCSeconds();
                HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
                HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
                HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
                HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
                HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
                HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
                var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
                var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
                HEAP32[tmPtr + 28 >> 2] = yday
            }
            var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
            var MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
            var MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            var ydayFromDate = date => {
                var leap = isLeapYear(date.getFullYear());
                var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
                var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
                return yday
            };

            function __localtime_js(time, tmPtr) {
                time = bigintToI53Checked(time);
                var date = new Date(time * 1e3);
                HEAP32[tmPtr >> 2] = date.getSeconds();
                HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
                HEAP32[tmPtr + 8 >> 2] = date.getHours();
                HEAP32[tmPtr + 12 >> 2] = date.getDate();
                HEAP32[tmPtr + 16 >> 2] = date.getMonth();
                HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
                HEAP32[tmPtr + 24 >> 2] = date.getDay();
                var yday = ydayFromDate(date) | 0;
                HEAP32[tmPtr + 28 >> 2] = yday;
                HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
                var start = new Date(date.getFullYear(), 0, 1);
                var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
                var winterOffset = start.getTimezoneOffset();
                var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
                HEAP32[tmPtr + 32 >> 2] = dst
            }
            var __mktime_js = function(tmPtr) {
                var ret = (() => {
                    var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
                    var dst = HEAP32[tmPtr + 32 >> 2];
                    var guessedOffset = date.getTimezoneOffset();
                    var start = new Date(date.getFullYear(), 0, 1);
                    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
                    var winterOffset = start.getTimezoneOffset();
                    var dstOffset = Math.min(winterOffset, summerOffset);
                    if (dst < 0) {
                        HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset)
                    } else if (dst > 0 != (dstOffset == guessedOffset)) {
                        var nonDstOffset = Math.max(winterOffset, summerOffset);
                        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
                        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4)
                    }
                    HEAP32[tmPtr + 24 >> 2] = date.getDay();
                    var yday = ydayFromDate(date) | 0;
                    HEAP32[tmPtr + 28 >> 2] = yday;
                    HEAP32[tmPtr >> 2] = date.getSeconds();
                    HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
                    HEAP32[tmPtr + 8 >> 2] = date.getHours();
                    HEAP32[tmPtr + 12 >> 2] = date.getDate();
                    HEAP32[tmPtr + 16 >> 2] = date.getMonth();
                    HEAP32[tmPtr + 20 >> 2] = date.getYear();
                    var timeMs = date.getTime();
                    if (isNaN(timeMs)) {
                        return -1
                    }
                    return timeMs / 1e3
                })();
                return BigInt(ret)
            };
            var __tzset_js = (timezone, daylight, std_name, dst_name) => {
                var currentYear = (new Date).getFullYear();
                var winter = new Date(currentYear, 0, 1);
                var summer = new Date(currentYear, 6, 1);
                var winterOffset = winter.getTimezoneOffset();
                var summerOffset = summer.getTimezoneOffset();
                var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
                HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
                HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
                var extractZone = timezoneOffset => {
                    var sign = timezoneOffset >= 0 ? "-" : "+";
                    var absOffset = Math.abs(timezoneOffset);
                    var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
                    var minutes = String(absOffset % 60).padStart(2, "0");
                    return `UTC${sign}${hours}${minutes}`
                };
                var winterName = extractZone(winterOffset);
                var summerName = extractZone(summerOffset);
                if (summerOffset < winterOffset) {
                    stringToUTF8(winterName, std_name, 17);
                    stringToUTF8(summerName, dst_name, 17)
                } else {
                    stringToUTF8(winterName, dst_name, 17);
                    stringToUTF8(summerName, std_name, 17)
                }
            };
            var _emscripten_get_now = () => performance.now();
            var _emscripten_date_now = () => Date.now();
            var nowIsMonotonic = 1;
            var checkWasiClock = clock_id => clock_id >= 0 && clock_id <= 3;

            function _clock_time_get(clk_id, ignored_precision, ptime) {
                ignored_precision = bigintToI53Checked(ignored_precision);
                if (!checkWasiClock(clk_id)) {
                    return 28
                }
                var now;
                if (clk_id === 0) {
                    now = _emscripten_date_now()
                } else if (nowIsMonotonic) {
                    now = _emscripten_get_now()
                } else {
                    return 52
                }
                var nsec = Math.round(now * 1e3 * 1e3);
                HEAP64[ptime >> 3] = BigInt(nsec);
                return 0
            }
            var getHeapMax = () => 2147483648;
            var _emscripten_get_heap_max = () => getHeapMax();
            var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
            var growMemory = size => {
                var b = wasmMemory.buffer;
                var pages = (size - b.byteLength + 65535) / 65536 | 0;
                try {
                    wasmMemory.grow(pages);
                    updateMemoryViews();
                    return 1
                } catch (e) {}
            };
            var _emscripten_resize_heap = requestedSize => {
                var oldSize = HEAPU8.length;
                requestedSize >>>= 0;
                var maxHeapSize = getHeapMax();
                if (requestedSize > maxHeapSize) {
                    return false
                }
                for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
                    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
                    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
                    var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
                    var replacement = growMemory(newSize);
                    if (replacement) {
                        return true
                    }
                }
                return false
            };
            var ENV = {};
            var getExecutableName = () => thisProgram || "./this.program";
            var getEnvStrings = () => {
                if (!getEnvStrings.strings) {
                    var lang = (typeof navigator == "object" && navigator.language || "C").replace("-", "_") + ".UTF-8";
                    var env = {
                        USER: "web_user",
                        LOGNAME: "web_user",
                        PATH: "/",
                        PWD: "/",
                        HOME: "/home/web_user",
                        LANG: lang,
                        _: getExecutableName()
                    };
                    for (var x in ENV) {
                        if (ENV[x] === undefined) delete env[x];
                        else env[x] = ENV[x]
                    }
                    var strings = [];
                    for (var x in env) {
                        strings.push(`${x}=${env[x]}`)
                    }
                    getEnvStrings.strings = strings
                }
                return getEnvStrings.strings
            };
            var _environ_get = (__environ, environ_buf) => {
                var bufSize = 0;
                var envp = 0;
                for (var string of getEnvStrings()) {
                    var ptr = environ_buf + bufSize;
                    HEAPU32[__environ + envp >> 2] = ptr;
                    bufSize += stringToUTF8(string, ptr, Infinity) + 1;
                    envp += 4
                }
                return 0
            };
            var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
                var strings = getEnvStrings();
                HEAPU32[penviron_count >> 2] = strings.length;
                var bufSize = 0;
                for (var string of strings) {
                    bufSize += lengthBytesUTF8(string) + 1
                }
                HEAPU32[penviron_buf_size >> 2] = bufSize;
                return 0
            };
            var runtimeKeepaliveCounter = 0;
            var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
            var _proc_exit = code => {
                EXITSTATUS = code;
                if (!keepRuntimeAlive()) {
                    Module["onExit"]?.(code);
                    ABORT = true
                }
                quit_(code, new ExitStatus(code))
            };
            var exitJS = (status, implicit) => {
                EXITSTATUS = status;
                _proc_exit(status)
            };
            var _exit = exitJS;

            function _fd_close(fd) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    FS.close(stream);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return e.errno
                }
            }

            function _fd_fdstat_get(fd, pbuf) {
                try {
                    var rightsBase = 0;
                    var rightsInheriting = 0;
                    var flags = 0;
                    {
                        var stream = SYSCALLS.getStreamFromFD(fd);
                        var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4
                    }
                    HEAP8[pbuf] = type;
                    HEAP16[pbuf + 2 >> 1] = flags;
                    HEAP64[pbuf + 8 >> 3] = BigInt(rightsBase);
                    HEAP64[pbuf + 16 >> 3] = BigInt(rightsInheriting);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return e.errno
                }
            }
            var doReadv = (stream, iov, iovcnt, offset) => {
                var ret = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAPU32[iov >> 2];
                    var len = HEAPU32[iov + 4 >> 2];
                    iov += 8;
                    var curr = FS.read(stream, HEAP8, ptr, len, offset);
                    if (curr < 0) return -1;
                    ret += curr;
                    if (curr < len) break;
                    if (typeof offset != "undefined") {
                        offset += curr
                    }
                }
                return ret
            };

            function _fd_read(fd, iov, iovcnt, pnum) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    var num = doReadv(stream, iov, iovcnt);
                    HEAPU32[pnum >> 2] = num;
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return e.errno
                }
            }

            function _fd_seek(fd, offset, whence, newOffset) {
                offset = bigintToI53Checked(offset);
                try {
                    if (isNaN(offset)) return 61;
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    FS.llseek(stream, offset, whence);
                    HEAP64[newOffset >> 3] = BigInt(stream.position);
                    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return e.errno
                }
            }
            var doWritev = (stream, iov, iovcnt, offset) => {
                var ret = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAPU32[iov >> 2];
                    var len = HEAPU32[iov + 4 >> 2];
                    iov += 8;
                    var curr = FS.write(stream, HEAP8, ptr, len, offset);
                    if (curr < 0) return -1;
                    ret += curr;
                    if (curr < len) {
                        break
                    }
                    if (typeof offset != "undefined") {
                        offset += curr
                    }
                }
                return ret
            };

            function _fd_write(fd, iov, iovcnt, pnum) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    var num = doWritev(stream, iov, iovcnt);
                    HEAPU32[pnum >> 2] = num;
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                    return e.errno
                }
            }
            var handleException = e => {
                if (e instanceof ExitStatus || e == "unwind") {
                    return EXITSTATUS
                }
                quit_(1, e)
            };
            var stackAlloc = sz => __emscripten_stack_alloc(sz);
            var stringToUTF8OnStack = str => {
                var size = lengthBytesUTF8(str) + 1;
                var ret = stackAlloc(size);
                stringToUTF8(str, ret, size);
                return ret
            };
            FS.createPreloadedFile = FS_createPreloadedFile;
            FS.staticInit();
            MEMFS.doesNotExistError = new FS.ErrnoError(44);
            MEMFS.doesNotExistError.stack = "<generic error, no stack>";
            if (ENVIRONMENT_IS_NODE) {
                NODEFS.staticInit()
            } {
                if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
                if (Module["preloadPlugins"]) preloadPlugins = Module["preloadPlugins"];
                if (Module["print"]) out = Module["print"];
                if (Module["printErr"]) err = Module["printErr"];
                if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
                if (Module["arguments"]) arguments_ = Module["arguments"];
                if (Module["thisProgram"]) thisProgram = Module["thisProgram"]
            }
            Module["callMain"] = callMain;
            Module["FS"] = FS;
            Module["NODEFS"] = NODEFS;
            Module["WORKERFS"] = WORKERFS;
            var _main, __emscripten_stack_restore, __emscripten_stack_alloc, _emscripten_stack_get_current;

            function assignWasmExports(wasmExports) {
                Module["_main"] = _main = wasmExports["__main_argc_argv"];
                __emscripten_stack_restore = wasmExports["_emscripten_stack_restore"];
                __emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"];
                _emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"]
            }
            var wasmImports = {
                __cxa_throw: ___cxa_throw,
                __syscall_chmod: ___syscall_chmod,
                __syscall_fchownat: ___syscall_fchownat,
                __syscall_fstat64: ___syscall_fstat64,
                __syscall_ftruncate64: ___syscall_ftruncate64,
                __syscall_getcwd: ___syscall_getcwd,
                __syscall_getdents64: ___syscall_getdents64,
                __syscall_ioctl: ___syscall_ioctl,
                __syscall_lstat64: ___syscall_lstat64,
                __syscall_mkdirat: ___syscall_mkdirat,
                __syscall_newfstatat: ___syscall_newfstatat,
                __syscall_openat: ___syscall_openat,
                __syscall_readlinkat: ___syscall_readlinkat,
                __syscall_renameat: ___syscall_renameat,
                __syscall_rmdir: ___syscall_rmdir,
                __syscall_stat64: ___syscall_stat64,
                __syscall_symlinkat: ___syscall_symlinkat,
                __syscall_unlinkat: ___syscall_unlinkat,
                __syscall_utimensat: ___syscall_utimensat,
                _abort_js: __abort_js,
                _gmtime_js: __gmtime_js,
                _localtime_js: __localtime_js,
                _mktime_js: __mktime_js,
                _tzset_js: __tzset_js,
                clock_time_get: _clock_time_get,
                emscripten_date_now: _emscripten_date_now,
                emscripten_get_heap_max: _emscripten_get_heap_max,
                emscripten_resize_heap: _emscripten_resize_heap,
                environ_get: _environ_get,
                environ_sizes_get: _environ_sizes_get,
                exit: _exit,
                fd_close: _fd_close,
                fd_fdstat_get: _fd_fdstat_get,
                fd_read: _fd_read,
                fd_seek: _fd_seek,
                fd_write: _fd_write
            };
            var wasmExports = await createWasm();

            function callMain(args = []) {
                var entryFunction = _main;
                args.unshift(thisProgram);
                var argc = args.length;
                var argv = stackAlloc((argc + 1) * 4);
                var argv_ptr = argv;
                args.forEach(arg => {
                    HEAPU32[argv_ptr >> 2] = stringToUTF8OnStack(arg);
                    argv_ptr += 4
                });
                HEAPU32[argv_ptr >> 2] = 0;
                try {
                    var ret = entryFunction(argc, argv);
                    exitJS(ret, true);
                    return ret
                } catch (e) {
                    return handleException(e)
                }
            }

            function run(args = arguments_) {
                if (runDependencies > 0) {
                    dependenciesFulfilled = run;
                    return
                }
                preRun();
                if (runDependencies > 0) {
                    dependenciesFulfilled = run;
                    return
                }

                function doRun() {
                    Module["calledRun"] = true;
                    if (ABORT) return;
                    initRuntime();
                    preMain();
                    readyPromiseResolve?.(Module);
                    Module["onRuntimeInitialized"]?.();
                    var noInitialRun = Module["noInitialRun"] || false;
                    if (!noInitialRun) callMain(args);
                    postRun()
                }
                if (Module["setStatus"]) {
                    Module["setStatus"]("Running...");
                    setTimeout(() => {
                        setTimeout(() => Module["setStatus"](""), 1);
                        doRun()
                    }, 1)
                } else {
                    doRun()
                }
            }

            function preInit() {
                if (Module["preInit"]) {
                    if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
                    while (Module["preInit"].length > 0) {
                        Module["preInit"].shift()()
                    }
                }
            }
            preInit();
            run();
            Module.FS = FS;
            Module.NODEFS = NODEFS;
            Module.WORKERFS = WORKERFS;
            Module.callMain = callMain;
            if (runtimeInitialized) {
                moduleRtn = Module
            } else {
                moduleRtn = new Promise((resolve, reject) => {
                    readyPromiseResolve = resolve;
                    readyPromiseReject = reject
                })
            }


            return moduleRtn;
        }
    );
})();
if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = SevenZip;
    // This default export looks redundant, but it allows TS to import this
    // commonjs style module.
    module.exports.default = SevenZip;
} else if (typeof define === 'function' && define['amd'])
    define([], () => SevenZip);
