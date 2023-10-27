
var TesseractCore = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(moduleArg = {}) {

// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = moduleArg;

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise((resolve, reject) => {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary;

if (ENVIRONMENT_IS_NODE) {

  // `require()` is no-op in an ESM module, use `createRequire()` to construct
  // the require()` function.  This is only necessary for multi-environment
  // builds, `-sENVIRONMENT=node` emits a static import declaration instead.
  // TODO: Swap all `require()`'s with `import()`'s?
  // These modules will usually be used on Node.js. Load them eagerly to avoid
  // the complexity of lazy-loading.
  var fs = require('fs');
  var nodePath = require('path');

  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = nodePath.dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js
read_ = (filename, binary) => {
  // We need to re-wrap `file://` strings to URLs. Normalizing isn't
  // necessary in that case, the path should already be absolute.
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  return fs.readFileSync(filename, binary ? undefined : 'utf8');
};

readBinary = (filename) => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  return ret;
};

readAsync = (filename, onload, onerror, binary = true) => {
  // See the comment in the `read_` function.
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
    if (err) onerror(err);
    else onload(binary ? data.buffer : data);
  });
};
// end include: node_shell_read.js
  if (!Module['thisProgram'] && process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, '/');
  }

  arguments_ = process.argv.slice(2);

  // MODULARIZE will export the module in the proper place outside, we don't need to export here

  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };

  Module['inspect'] = () => '[Emscripten Module object]';

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {
// include: web_or_worker_shell_read.js
read_ = (url) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }
} else
{
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.error.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];

if (Module['thisProgram']) thisProgram = Module['thisProgram'];

if (Module['quit']) quit_ = Module['quit'];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message

// end include: shell.js
// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];

if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    // This build was created without ASSERTIONS defined.  `assert()` should not
    // ever be called in this configuration but in case there are callers in
    // the wild leave this simple abort() implemenation here for now.
    abort(text);
  }
}

// Memory management

var HEAP,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}

// include: runtime_stack_check.js
// end include: runtime_stack_check.js
// include: runtime_assertions.js
// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;

  
if (!Module["noFSInit"] && !FS.init.initialized)
  FS.init();
FS.ignorePermissions = false;

TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  
  callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  what += '. Build with -sASSERTIONS for more info.';

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */
var isDataURI = (filename) => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = (filename) => filename.startsWith('file://');
// end include: URIUtils.js
// include: runtime_exceptions.js
// end include: runtime_exceptions.js
var wasmBinaryFile;
  wasmBinaryFile = 'tesseract-core-simd-lstm.wasm';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw "both async and sync fetching of the wasm failed";
}

function getBinaryPromise(binaryFile) {
  // If we don't have the binary yet, try to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary
      && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function'
      && !isFileURI(binaryFile)
    ) {
      return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + binaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(() => getBinarySync(binaryFile));
    }
    else if (readAsync) {
      // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
      return new Promise((resolve, reject) => {
        readAsync(binaryFile, (response) => resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))), reject)
      });
    }
  }

  // Otherwise, getBinarySync should be able to get it synchronously
  return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile).then((binary) => {
    return WebAssembly.instantiate(binary, imports);
  }).then((instance) => {
    return instance;
  }).then(receiver, (reason) => {
    err(`failed to asynchronously prepare wasm: ${reason}`);

    abort(reason);
  });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
  if (!binary &&
      typeof WebAssembly.instantiateStreaming == 'function' &&
      !isDataURI(binaryFile) &&
      // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
      !isFileURI(binaryFile) &&
      // Avoid instantiateStreaming() on Node.js environment for now, as while
      // Node.js v18.1.0 implements it, it does not have a full fetch()
      // implementation yet.
      //
      // Reference:
      //   https://github.com/emscripten-core/emscripten/pull/16917
      !ENVIRONMENT_IS_NODE &&
      typeof fetch == 'function') {
    return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
      // Suppress closure warning here since the upstream definition for
      // instantiateStreaming only allows Promise<Repsponse> rather than
      // an actual Response.
      // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
      /** @suppress {checkTypes} */
      var result = WebAssembly.instantiateStreaming(response, imports);

      return result.then(
        callback,
        function(reason) {
          // We expect the most common failure cause to be a bad MIME type for the binary,
          // in which case falling back to ArrayBuffer instantiation should work.
          err(`wasm streaming compile failed: ${reason}`);
          err('falling back to ArrayBuffer instantiation');
          return instantiateArrayBuffer(binaryFile, imports, callback);
        });
    });
  }
  return instantiateArrayBuffer(binaryFile, imports, callback);
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;

    

    wasmMemory = wasmExports['memory'];
    
    updateMemoryViews();

    wasmTable = wasmExports['__indirect_function_table'];
    

    removeRunDependency('wasm-instantiate');
    return wasmExports;
  }
  // wait for the pthread pool (if any)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {

    try {
      return Module['instantiateWasm'](info, receiveInstance);
    } catch(e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
        // If instantiation fails, reject the module ready promise.
        readyPromiseReject(e);
    }
  }

  // If instantiation fails, reject the module ready promise.
  instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// include: runtime_debug.js
// end include: runtime_debug.js
// === Body ===

var ASM_CONSTS = {
  425804: ($0) => { if(Module['TesseractProgress']) Module['TesseractProgress']($0); },  
 425873: ($0) => { if(Module['TesseractProgress']) Module['TesseractProgress']($0); }
};


// end include: preamble.js

  /** @constructor */
  function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }

  var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };

  var withStackSave = (f) => {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    };
  
  
  
  var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
  
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt(i); // possibly a lead surrogate
        if (u >= 0xD800 && u <= 0xDFFF) {
          var u1 = str.charCodeAt(++i);
          u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
        }
        if (u <= 0x7F) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7FF) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xC0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xE0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };
  var stringToUTF8OnStack = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    };
  
  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
  
    /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
  var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.  Also, use the length info to avoid running tiny
      // strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation,
      // so that undefined means Infinity)
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      // If building with TextDecoder, we have already computed the string length
      // above, so test loop end condition against that
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
        var u0 = heapOrArray[idx++];
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
  
        if (u0 < 0x10000) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
      }
      return str;
    };
  
    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
  var UTF8ToString = (ptr, maxBytesToRead) => {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    };
  var demangle = (func) => {
      // If demangle has failed before, stop demangling any further function names
      // This avoids an infinite recursion with malloc()->abort()->stackTrace()->demangle()->malloc()->...
      demangle.recursionGuard = (demangle.recursionGuard|0)+1;
      if (demangle.recursionGuard > 1) return func;
      return withStackSave(() => {
        try {
          var s = func;
          if (s.startsWith('__Z'))
            s = s.substr(1);
          var buf = stringToUTF8OnStack(s);
          var status = stackAlloc(4);
          var ret = ___cxa_demangle(buf, 0, 0, status);
          if (HEAP32[((status)>>2)] === 0 && ret) {
            return UTF8ToString(ret);
          }
          // otherwise, libcxxabi failed
        } catch(e) {
        } finally {
          _free(ret);
          if (demangle.recursionGuard < 2) --demangle.recursionGuard;
        }
        // failure when using libcxxabi, don't demangle
        return func;
      });
    };

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': abort('to do getValue(i64) use WASM_BIGINT');
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  var noExitRuntime = Module['noExitRuntime'] || true;

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': abort('to do setValue(i64) use WASM_BIGINT');
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only
        // populated if an Error object is thrown, so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }
  
  var demangleAll = (text) => {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    };
  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  
  
  var PATH = {
  isAbs:(path) => path.charAt(0) === '/',
  splitPath:(filename) => {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },
  normalizeArray:(parts, allowAboveRoot) => {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },
  normalize:(path) => {
        var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter((p) => !!p), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },
  dirname:(path) => {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },
  basename:(path) => {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },
  join:function() {
        var paths = Array.prototype.slice.call(arguments);
        return PATH.normalize(paths.join('/'));
      },
  join2:(l, r) => {
        return PATH.normalize(l + '/' + r);
      },
  };
  
  var initRandomFill = () => {
      if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
        // for modern web browsers
        return (view) => crypto.getRandomValues(view);
      } else
      if (ENVIRONMENT_IS_NODE) {
        // for nodejs with or without crypto support included
        try {
          var crypto_module = require('crypto');
          var randomFillSync = crypto_module['randomFillSync'];
          if (randomFillSync) {
            // nodejs with LTS crypto support
            return (view) => crypto_module['randomFillSync'](view);
          }
          // very old nodejs with the original crypto API
          var randomBytes = crypto_module['randomBytes'];
          return (view) => (
            view.set(randomBytes(view.byteLength)),
            // Return the original view to match modern native implementations.
            view
          );
        } catch (e) {
          // nodejs doesn't have crypto support
        }
      }
      // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
      abort("initRandomDevice");
    };
  var randomFill = (view) => {
      // Lazily init on the first invocation.
      return (randomFill = initRandomFill())(view);
    };
  
  
  
  var PATH_FS = {
  resolve:function() {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path);
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter((p) => !!p), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },
  relative:(from, to) => {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      },
  };
  
  
  
  var FS_stdin_getChar_buffer = [];
  
  
  /** @type {function(string, boolean=, number=)} */
  function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
  }
  var FS_stdin_getChar = () => {
      if (!FS_stdin_getChar_buffer.length) {
        var result = null;
        if (ENVIRONMENT_IS_NODE) {
          // we will read data by chunks of BUFSIZE
          var BUFSIZE = 256;
          var buf = Buffer.alloc(BUFSIZE);
          var bytesRead = 0;
  
          // For some reason we must suppress a closure warning here, even though
          // fd definitely exists on process.stdin, and is even the proper way to
          // get the fd of stdin,
          // https://github.com/nodejs/help/issues/2136#issuecomment-523649904
          // This started to happen after moving this logic out of library_tty.js,
          // so it is related to the surrounding code in some unclear manner.
          /** @suppress {missingProperties} */
          var fd = process.stdin.fd;
  
          try {
            bytesRead = fs.readSync(fd, buf);
          } catch(e) {
            // Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
            // reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
            if (e.toString().includes('EOF')) bytesRead = 0;
            else throw e;
          }
  
          if (bytesRead > 0) {
            result = buf.slice(0, bytesRead).toString('utf-8');
          } else {
            result = null;
          }
        } else
        if (typeof window != 'undefined' &&
          typeof window.prompt == 'function') {
          // Browser.
          result = window.prompt('Input: ');  // returns null on cancel
          if (result !== null) {
            result += '\n';
          }
        } else if (typeof readline == 'function') {
          // Command line.
          result = readline();
          if (result !== null) {
            result += '\n';
          }
        }
        if (!result) {
          return null;
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true);
      }
      return FS_stdin_getChar_buffer.shift();
    };
  var TTY = {
  ttys:[],
  init() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process.stdin.setEncoding('utf8');
        // }
      },
  shutdown() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process.stdin.pause();
        // }
      },
  register(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },
  stream_ops:{
  open(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },
  close(stream) {
          // flush any pending line data
          stream.tty.ops.fsync(stream.tty);
        },
  fsync(stream) {
          stream.tty.ops.fsync(stream.tty);
        },
  read(stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },
  write(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        },
  },
  default_tty_ops:{
  get_char(tty) {
          return FS_stdin_getChar();
        },
  put_char(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },
  fsync(tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        },
  ioctl_tcgets(tty) {
          // typical setting
          return {
            c_iflag: 25856,
            c_oflag: 5,
            c_cflag: 191,
            c_lflag: 35387,
            c_cc: [
              0x03, 0x1c, 0x7f, 0x15, 0x04, 0x00, 0x01, 0x00, 0x11, 0x13, 0x1a, 0x00,
              0x12, 0x0f, 0x17, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
              0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            ]
          };
        },
  ioctl_tcsets(tty, optional_actions, data) {
          // currently just ignore
          return 0;
        },
  ioctl_tiocgwinsz(tty) {
          return [24, 80];
        },
  },
  default_tty1_ops:{
  put_char(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
  fsync(tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        },
  },
  };
  
  
  var zeroMemory = (address, size) => {
      HEAPU8.fill(0, address, address + size);
      return address;
    };
  
  var alignMemory = (size, alignment) => {
      return Math.ceil(size / alignment) * alignment;
    };
  var mmapAlloc = (size) => {
      abort();
    };
  var MEMFS = {
  ops_table:null,
  mount(mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },
  createNode(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
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
                allocate: MEMFS.stream_ops.allocate,
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
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },
  getFileDataAsTypedArray(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },
  expandFileStorage(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },
  resizeFileStorage(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },
  node_ops:{
  getattr(node) {
          var attr = {};
          // device numbers reuse inode numbers.
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
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },
  setattr(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },
  lookup(parent, name) {
          throw FS.genericErrors[44];
        },
  mknod(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },
  rename(old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now()
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
          old_node.parent = new_dir;
        },
  unlink(parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
  rmdir(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
  readdir(node) {
          var entries = ['.', '..'];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },
  symlink(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },
  readlink(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        },
  },
  stream_ops:{
  read(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },
  write(stream, buffer, offset, length, position, canOwn) {
          // If the buffer is located in main memory (HEAP), and if
          // memory can grow, we can't hold on to references of the
          // memory buffer, as they may get invalidated. That means we
          // need to do copy its contents.
          if (buffer.buffer === HEAP8.buffer) {
            canOwn = false;
          }
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },
  llseek(stream, offset, whence) {
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
        },
  allocate(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },
  mmap(stream, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the
            // buffer we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
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
          return { ptr, allocated };
        },
  msync(stream, buffer, offset, length, mmapFlags) {
          MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        },
  },
  };
  
  /** @param {boolean=} noRunDep */
  var asyncLoad = (url, onload, onerror, noRunDep) => {
      var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : '';
      readAsync(url, (arrayBuffer) => {
        assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      }, (event) => {
        if (onerror) {
          onerror();
        } else {
          throw `Loading data file "${url}" failed.`;
        }
      });
      if (dep) addRunDependency(dep);
    };
  
  
  var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
      return FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
    };
  
  var preloadPlugins = Module['preloadPlugins'] || [];
  var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
      // Ensure plugins are ready.
      if (typeof Browser != 'undefined') Browser.init();
  
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled) return;
        if (plugin['canHandle'](fullname)) {
          plugin['handle'](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    };
  var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      // TODO we should allow people to just pass in a complete filename instead
      // of parent and name being that we just join them anyways
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`); // might have several active requests for the same fullname
      function processData(byteArray) {
        function finish(byteArray) {
          if (preFinish) preFinish();
          if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
          }
          if (onload) onload();
          removeRunDependency(dep);
        }
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          if (onerror) onerror();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == 'string') {
        asyncLoad(url, (byteArray) => processData(byteArray), onerror);
      } else {
        processData(url);
      }
    };
  
  var FS_modeStringToFlags = (str) => {
      var flagModes = {
        'r': 0,
        'r+': 2,
        'w': 512 | 64 | 1,
        'w+': 512 | 64 | 2,
        'a': 1024 | 64 | 1,
        'a+': 1024 | 64 | 2,
      };
      var flags = flagModes[str];
      if (typeof flags == 'undefined') {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    };
  
  var FS_getMode = (canRead, canWrite) => {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    };
  
  
  
  var FS = {
  root:null,
  mounts:[],
  devices:{
  },
  streams:[],
  nextInode:1,
  nameTable:null,
  currentPath:"/",
  initialized:false,
  ignorePermissions:true,
  ErrnoError:null,
  genericErrors:{
  },
  filesystems:null,
  syncFSRequests:0,
  lookupPath(path, opts = {}) {
        path = PATH_FS.resolve(path);
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        opts = Object.assign(defaults, opts)
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(32);
        }
  
        // split the absolute path
        var parts = path.split('/').filter((p) => !!p);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },
  getPath(node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? `${mount}/${path}` : mount + path;
          }
          path = path ? `${node.name}/${path}` : node.name;
          node = node.parent;
        }
      },
  hashName(parentid, name) {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },
  hashAddNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },
  hashRemoveNode(node) {
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
      },
  lookupNode(parent, name) {
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
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },
  createNode(parent, name, mode, rdev) {
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },
  destroyNode(node) {
        FS.hashRemoveNode(node);
      },
  isRoot(node) {
        return node === node.parent;
      },
  isMountpoint(node) {
        return !!node.mounted;
      },
  isFile(mode) {
        return (mode & 61440) === 32768;
      },
  isDir(mode) {
        return (mode & 61440) === 16384;
      },
  isLink(mode) {
        return (mode & 61440) === 40960;
      },
  isChrdev(mode) {
        return (mode & 61440) === 8192;
      },
  isBlkdev(mode) {
        return (mode & 61440) === 24576;
      },
  isFIFO(mode) {
        return (mode & 61440) === 4096;
      },
  isSocket(mode) {
        return (mode & 49152) === 49152;
      },
  flagsToPermissionString(flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },
  nodePermissions(node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },
  mayLookup(dir) {
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },
  mayCreate(dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },
  mayDelete(dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
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
      },
  mayOpen(node, flags) {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },
  MAX_OPEN_FDS:4096,
  nextfd() {
        for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },
  getStreamChecked(fd) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        return stream;
      },
  getStream:(fd) => FS.streams[fd],
  createStream(stream, fd = -1) {
        if (!FS.FSStream) {
          FS.FSStream = /** @constructor */ function() {
            this.shared = { };
          };
          FS.FSStream.prototype = {};
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              /** @this {FS.FSStream} */
              get() { return this.node; },
              /** @this {FS.FSStream} */
              set(val) { this.node = val; }
            },
            isRead: {
              /** @this {FS.FSStream} */
              get() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              /** @this {FS.FSStream} */
              get() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              /** @this {FS.FSStream} */
              get() { return (this.flags & 1024); }
            },
            flags: {
              /** @this {FS.FSStream} */
              get() { return this.shared.flags; },
              /** @this {FS.FSStream} */
              set(val) { this.shared.flags = val; },
            },
            position : {
              /** @this {FS.FSStream} */
              get() { return this.shared.position; },
              /** @this {FS.FSStream} */
              set(val) { this.shared.position = val; },
            },
          });
        }
        // clone it, so we can return an instance of FSStream
        stream = Object.assign(new FS.FSStream(), stream);
        if (fd == -1) {
          fd = FS.nextfd();
        }
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },
  closeStream(fd) {
        FS.streams[fd] = null;
      },
  chrdev_stream_ops:{
  open(stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },
  llseek() {
          throw new FS.ErrnoError(70);
        },
  },
  major:(dev) => ((dev) >> 8),
  minor:(dev) => ((dev) & 0xff),
  makedev:(ma, mi) => ((ma) << 8 | (mi)),
  registerDevice(dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },
  getDevice:(dev) => FS.devices[dev],
  getMounts(mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },
  syncfs(populate, callback) {
        if (typeof populate == 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
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
        };
  
        // sync all mounts
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },
  mount(type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type,
          opts,
          mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },
  unmount(mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1);
      },
  lookup(parent, name) {
        return parent.node_ops.lookup(parent, name);
      },
  mknod(path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
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
      },
  create(path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },
  mkdir(path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },
  mkdirTree(path, mode) {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },
  mkdev(path, mode, dev) {
        if (typeof dev == 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },
  symlink(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
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
      },
  rename(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existant directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },
  rmdir(path) {
        var lookup = FS.lookupPath(path, { parent: true });
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
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },
  readdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },
  unlink(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },
  readlink(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },
  stat(path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },
  lstat(path) {
        return FS.stat(path, true);
      },
  chmod(path, mode, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },
  lchmod(path, mode) {
        FS.chmod(path, mode, true);
      },
  fchmod(fd, mode) {
        var stream = FS.getStreamChecked(fd);
        FS.chmod(stream.node, mode);
      },
  chown(path, uid, gid, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },
  lchown(path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },
  fchown(fd, uid, gid) {
        var stream = FS.getStreamChecked(fd);
        FS.chown(stream.node, uid, gid);
      },
  truncate(path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
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
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },
  ftruncate(fd, len) {
        var stream = FS.getStreamChecked(fd);
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },
  utime(path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },
  open(path, flags, mode) {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
        mode = typeof mode == 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path == 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512) && !created) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        });
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },
  close(stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
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
      },
  isClosed(stream) {
        return stream.fd === null;
      },
  llseek(stream, offset, whence) {
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
      },
  read(stream, buffer, offset, length, position) {
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
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },
  write(stream, buffer, offset, length, position, canOwn) {
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
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },
  allocate(stream, offset, length) {
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
      },
  mmap(stream, length, position, prot, flags) {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      },
  msync(stream, buffer, offset, length, mmapFlags) {
        if (!stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },
  munmap:(stream) => 0,
  ioctl(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },
  readFile(path, opts = {}) {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error(`Invalid encoding type "${opts.encoding}"`);
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },
  writeFile(path, data, opts = {}) {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },
  cwd:() => FS.currentPath,
  chdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },
  createDefaultDirectories() {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },
  createDefaultDevices() {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        // use a buffer to avoid overhead of individual crypto calls per byte
        var randomBuffer = new Uint8Array(1024), randomLeft = 0;
        var randomByte = () => {
          if (randomLeft === 0) {
            randomLeft = randomFill(randomBuffer).byteLength;
          }
          return randomBuffer[--randomLeft];
        };
        FS.createDevice('/dev', 'random', randomByte);
        FS.createDevice('/dev', 'urandom', randomByte);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },
  createSpecialDirectories() {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount() {
            var node = FS.createNode(proc_self, 'fd', 16384 | 511 /* 0777 */, 73);
            node.node_ops = {
              lookup(parent, name) {
                var fd = +name;
                var stream = FS.getStreamChecked(fd);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: () => stream.path },
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },
  createStandardStreams() {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
      },
  ensureErrnoError() {
        if (FS.ErrnoError) return;
        FS.ErrnoError = /** @this{Object} */ function ErrnoError(errno, node) {
          // We set the `name` property to be able to identify `FS.ErrnoError`
          // - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
          // - when using PROXYFS, an error can come from an underlying FS
          // as different FS objects have their own FS.ErrnoError each,
          // the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
          // we'll use the reliable test `err.name == "ErrnoError"` instead
          this.name = 'ErrnoError';
          this.node = node;
          this.setErrno = /** @this{Object} */ function(errno) {
            this.errno = errno;
          };
          this.setErrno(errno);
          this.message = 'FS error';
  
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [44].forEach((code) => {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },
  staticInit() {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },
  init(input, output, error) {
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },
  quit() {
        FS.init.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },
  findObject(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
          return null;
        }
        return ret.object;
      },
  analyzePath(path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },
  createPath(parent, path, canRead, canWrite) {
        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },
  createFile(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(canRead, canWrite);
        return FS.create(path, mode);
      },
  createDataFile(parent, name, data, canRead, canWrite, canOwn) {
        var path = name;
        if (parent) {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS_getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },
  createDevice(parent, name, input, output) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open(stream) {
            stream.seekable = false;
          },
          close(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },
  forceLoadFile(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (read_) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(read_(obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
      },
  createLazyFile(parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        /** @constructor */
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = /** @this{Object} */ function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (from, to) => {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
            }
            return intArrayFromString(xhr.responseText || '', true);
          };
          var lazyArray = this;
          lazyArray.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
            return lazyArray.chunks[chunkNum];
          });
  
          if (usesGzip || !datalength) {
            // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
            chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest != 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            },
            chunkSize: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: /** @this {FSNode} */ function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            FS.forceLoadFile(node);
            return fn.apply(null, arguments);
          };
        });
        function writeChunks(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        }
        // use a custom read function
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          return writeChunks(stream, buffer, offset, length, position)
        };
        // use a custom mmap function
        stream_ops.mmap = (stream, length, position, prot, flags) => {
          FS.forceLoadFile(node);
          var ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          writeChunks(stream, HEAP8, ptr, length, position);
          return { ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
      },
  };
  
  var SYSCALLS = {
  DEFAULT_POLLMASK:5,
  calculateAt(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = SYSCALLS.getStreamFromFD(dirfd);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },
  doStat(func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -54;
          }
          throw e;
        }
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(4))>>2)] = stat.mode;
        HEAPU32[(((buf)+(8))>>2)] = stat.nlink;
        HEAP32[(((buf)+(12))>>2)] = stat.uid;
        HEAP32[(((buf)+(16))>>2)] = stat.gid;
        HEAP32[(((buf)+(20))>>2)] = stat.rdev;
        (tempI64 = [stat.size>>>0,(tempDouble=stat.size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(24))>>2)] = tempI64[0],HEAP32[(((buf)+(28))>>2)] = tempI64[1]);
        HEAP32[(((buf)+(32))>>2)] = 4096;
        HEAP32[(((buf)+(36))>>2)] = stat.blocks;
        var atime = stat.atime.getTime();
        var mtime = stat.mtime.getTime();
        var ctime = stat.ctime.getTime();
        (tempI64 = [Math.floor(atime / 1000)>>>0,(tempDouble=Math.floor(atime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(40))>>2)] = tempI64[0],HEAP32[(((buf)+(44))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(48))>>2)] = (atime % 1000) * 1000;
        (tempI64 = [Math.floor(mtime / 1000)>>>0,(tempDouble=Math.floor(mtime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(56))>>2)] = tempI64[0],HEAP32[(((buf)+(60))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(64))>>2)] = (mtime % 1000) * 1000;
        (tempI64 = [Math.floor(ctime / 1000)>>>0,(tempDouble=Math.floor(ctime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(72))>>2)] = tempI64[0],HEAP32[(((buf)+(76))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(80))>>2)] = (ctime % 1000) * 1000;
        (tempI64 = [stat.ino>>>0,(tempDouble=stat.ino,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(88))>>2)] = tempI64[0],HEAP32[(((buf)+(92))>>2)] = tempI64[1]);
        return 0;
      },
  doMsync(addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (flags & 2) {
          // MAP_PRIVATE calls need not to be synced back to underlying fs
          return 0;
        }
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },
  varargs:undefined,
  get() {
        // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
        var ret = HEAP32[((+SYSCALLS.varargs)>>2)];
        SYSCALLS.varargs += 4;
        return ret;
      },
  getp() { return SYSCALLS.get() },
  getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
  getStreamFromFD(fd) {
        var stream = FS.getStreamChecked(fd);
        return stream;
      },
  };
  function ___syscall_getcwd(buf, size) {
  try {
  
      if (size === 0) return -28;
      var cwd = FS.cwd();
      var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
      if (size < cwdLengthInBytes) return -68;
      stringToUTF8(cwd, buf, size);
      return cwdLengthInBytes;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  }

  function ___syscall_rmdir(path) {
  try {
  
      path = SYSCALLS.getStr(path);
      FS.rmdir(path);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  }

  function ___syscall_unlinkat(dirfd, path, flags) {
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      if (flags === 0) {
        FS.unlink(path);
      } else if (flags === 512) {
        FS.rmdir(path);
      } else {
        abort('Invalid flags passed to unlinkat');
      }
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  }

  
  
  var __emscripten_fs_load_embedded_files = (ptr) => {
      do {
        var name_addr = HEAPU32[((ptr)>>2)];
        ptr += 4;
        var len = HEAPU32[((ptr)>>2)];
        ptr += 4;
        var content = HEAPU32[((ptr)>>2)];
        ptr += 4;
        var name = UTF8ToString(name_addr)
        FS.createPath('/', PATH.dirname(name), true, true);
        // canOwn this data in the filesystem, it is a slice of wasm memory that will never change
        FS.createDataFile(name, null, HEAP8.subarray(content, content + len), true, true, true);
      } while (HEAPU32[((ptr)>>2)]);
    };

  var __emscripten_throw_longjmp = () => {
      throw Infinity;
    };

  var _emscripten_get_now;
      // Modern environment where performance.now() is supported:
      // N.B. a shorter form "_emscripten_get_now = performance.now;" is
      // unfortunately not allowed even in current browsers (e.g. FF Nightly 75).
      _emscripten_get_now = () => performance.now();
  ;
  
  var nowIsMonotonic = true;;
  
  var checkWasiClock = (clock_id) => {
      return clock_id == 0 ||
             clock_id == 1 ||
             clock_id == 2 ||
             clock_id == 3;
    };
  
  
  var convertI32PairToI53Checked = (lo, hi) => {
      return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
    };
  function _clock_time_get(clk_id,ignored_precision_low, ignored_precision_high,ptime) {
    var ignored_precision = convertI32PairToI53Checked(ignored_precision_low, ignored_precision_high);;
  
    
      if (!checkWasiClock(clk_id)) {
        return 28;
      }
      var now;
      // all wasi clocks but realtime are monotonic
      if (clk_id === 0) {
        now = Date.now();
      } else if (nowIsMonotonic) {
        now = _emscripten_get_now();
      } else {
        return 52;
      }
      // "now" is in ms, and wasi times are in ns.
      var nsec = Math.round(now * 1000 * 1000);
      HEAP32[((ptime)>>2)] = nsec >>> 0;
      HEAP32[(((ptime)+(4))>>2)] = (nsec / Math.pow(2, 32)) >>> 0;
      return 0;
    ;
  }

  var readEmAsmArgsArray = [];
  var readEmAsmArgs = (sigPtr, buf) => {
      readEmAsmArgsArray.length = 0;
      var ch;
      // Most arguments are i32s, so shift the buffer pointer so it is a plain
      // index into HEAP32.
      while (ch = HEAPU8[sigPtr++]) {
        // Floats are always passed as doubles, so all types except for 'i'
        // are 8 bytes and require alignment.
        var wide = (ch != 105);
        wide &= (ch != 112);
        buf += wide && (buf % 8) ? 4 : 0;
        readEmAsmArgsArray.push(
          // Special case for pointers under wasm64 or CAN_ADDRESS_2GB mode.
          ch == 112 ? HEAPU32[((buf)>>2)] :
          ch == 105 ?
            HEAP32[((buf)>>2)] :
            HEAPF64[((buf)>>3)]
        );
        buf += wide ? 8 : 4;
      }
      return readEmAsmArgsArray;
    };
  var runEmAsmFunction = (code, sigPtr, argbuf) => {
      var args = readEmAsmArgs(sigPtr, argbuf);
      return ASM_CONSTS[code].apply(null, args);
    };
  var _emscripten_asm_const_int = (code, sigPtr, argbuf) => {
      return runEmAsmFunction(code, sigPtr, argbuf);
    };

  var _emscripten_notify_memory_growth = (memoryIndex) => {
      updateMemoryViews();
    };

  var ENV = {
  };
  
  var getExecutableName = () => {
      return thisProgram || './this.program';
    };
  var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
        var lang = ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
        var env = {
          'USER': 'web_user',
          'LOGNAME': 'web_user',
          'PATH': '/',
          'PWD': '/',
          'HOME': '/home/web_user',
          'LANG': lang,
          '_': getExecutableName()
        };
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
  
  var stringToAscii = (str, buffer) => {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
      }
      // Null-terminate the string
      HEAP8[((buffer)>>0)] = 0;
    };
  
  var _environ_get = (__environ, environ_buf) => {
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        HEAPU32[(((__environ)+(i*4))>>2)] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    };

  
  var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      HEAPU32[((penviron_count)>>2)] = strings.length;
      var bufSize = 0;
      strings.forEach((string) => bufSize += string.length + 1);
      HEAPU32[((penviron_buf_size)>>2)] = bufSize;
      return 0;
    };

  function _fd_close(fd) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  }

  /** @param {number=} offset */
  var doReadv = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break; // nothing more to read
        if (typeof offset !== 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  function _fd_read(fd, iov, iovcnt, pnum) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doReadv(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  }

  
  function _fd_seek(fd,offset_low, offset_high,whence,newOffset) {
    var offset = convertI32PairToI53Checked(offset_low, offset_high);;
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.llseek(stream, offset, whence);
      (tempI64 = [stream.position>>>0,(tempDouble=stream.position,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[((newOffset)>>2)] = tempI64[0],HEAP32[(((newOffset)+(4))>>2)] = tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  ;
  }

  /** @param {number=} offset */
  var doWritev = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (typeof offset !== 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  function _fd_write(fd, iov, iovcnt, pnum) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doWritev(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  }

  
  var runtimeKeepaliveCounter = 0;
  var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
  
  var _proc_exit = (code) => {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        if (Module['onExit']) Module['onExit'](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    };

  var setErrNo = (value) => {
      HEAP32[((___errno_location())>>2)] = value;
      return value;
    };
  
  var _system = (command) => {
      if (ENVIRONMENT_IS_NODE) {
        if (!command) return 1; // shell is available
  
        var cmdstr = UTF8ToString(command);
        if (!cmdstr.length) return 0; // this is what glibc seems to do (shell works test?)
  
        var cp = require('child_process');
        var ret = cp.spawnSync(cmdstr, [], {shell:true, stdio:'inherit'});
  
        var _W_EXITCODE = (ret, sig) => ((ret) << 8 | (sig));
  
        // this really only can happen if process is killed by signal
        if (ret.status === null) {
          // sadly node doesn't expose such function
          var signalToNumber = (sig) => {
            // implement only the most common ones, and fallback to SIGINT
            switch (sig) {
              case 'SIGHUP': return 1;
              case 'SIGINT': return 2;
              case 'SIGQUIT': return 3;
              case 'SIGFPE': return 8;
              case 'SIGKILL': return 9;
              case 'SIGALRM': return 14;
              case 'SIGTERM': return 15;
            }
            return 2; // SIGINT
          }
          return _W_EXITCODE(0, signalToNumber(ret.signal));
        }
  
        return _W_EXITCODE(ret.status, 0);
      }
      // int system(const char *command);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/system.html
      // Can't call external programs.
      if (!command) return 0; // no shell available
      setErrNo(52);
      return -1;
    };

  /** @param {boolean|number=} implicit */
  var exitJS = (status, implicit) => {
      EXITSTATUS = status;
  
      _proc_exit(status);
    };

  var handleException = (e) => {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    };

  var wasmTableMirror = [];
  
  var wasmTable;
  var getWasmTableEntry = (funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      return func;
    };







  var FS_unlink = (path) => FS.unlink(path);

  var FSNode = /** @constructor */ function(parent, name, mode, rdev) {
    if (!parent) {
      parent = this;  // root node sets parent to itself
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
  var readMode = 292/*292*/ | 73/*73*/;
  var writeMode = 146/*146*/;
  Object.defineProperties(FSNode.prototype, {
   read: {
    get: /** @this{FSNode} */function() {
     return (this.mode & readMode) === readMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= readMode : this.mode &= ~readMode;
    }
   },
   write: {
    get: /** @this{FSNode} */function() {
     return (this.mode & writeMode) === writeMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= writeMode : this.mode &= ~writeMode;
    }
   },
   isFolder: {
    get: /** @this{FSNode} */function() {
     return FS.isDir(this.mode);
    }
   },
   isDevice: {
    get: /** @this{FSNode} */function() {
     return FS.isChrdev(this.mode);
    }
   }
  });
  FS.FSNode = FSNode;
  FS.createPreloadedFile = FS_createPreloadedFile;
  FS.staticInit();Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_unlink"] = FS.unlink;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createDevice"] = FS.createDevice;;
var wasmImports = {
  /** @export */
  __syscall_getcwd: ___syscall_getcwd,
  /** @export */
  __syscall_rmdir: ___syscall_rmdir,
  /** @export */
  __syscall_unlinkat: ___syscall_unlinkat,
  /** @export */
  _emscripten_fs_load_embedded_files: __emscripten_fs_load_embedded_files,
  /** @export */
  _emscripten_throw_longjmp: __emscripten_throw_longjmp,
  /** @export */
  clock_time_get: _clock_time_get,
  /** @export */
  emscripten_asm_const_int: _emscripten_asm_const_int,
  /** @export */
  emscripten_notify_memory_growth: _emscripten_notify_memory_growth,
  /** @export */
  environ_get: _environ_get,
  /** @export */
  environ_sizes_get: _environ_sizes_get,
  /** @export */
  fd_close: _fd_close,
  /** @export */
  fd_read: _fd_read,
  /** @export */
  fd_seek: _fd_seek,
  /** @export */
  fd_write: _fd_write,
  /** @export */
  invoke_ii: invoke_ii,
  /** @export */
  invoke_iii: invoke_iii,
  /** @export */
  invoke_iiii: invoke_iiii,
  /** @export */
  invoke_iiiii: invoke_iiiii,
  /** @export */
  invoke_iiiiii: invoke_iiiiii,
  /** @export */
  invoke_vi: invoke_vi,
  /** @export */
  invoke_vii: invoke_vii,
  /** @export */
  invoke_viid: invoke_viid,
  /** @export */
  invoke_viii: invoke_viii,
  /** @export */
  invoke_viiii: invoke_viiii,
  /** @export */
  invoke_viiiii: invoke_viiiii,
  /** @export */
  invoke_viiiiiiiii: invoke_viiiiiiiii,
  /** @export */
  proc_exit: _proc_exit,
  /** @export */
  system: _system
};
var wasmExports = createWasm();
var _ParagraphJustification___destroy___0 = Module['_ParagraphJustification___destroy___0'] = (a0) => (_ParagraphJustification___destroy___0 = Module['_ParagraphJustification___destroy___0'] = wasmExports['ParagraphJustification___destroy___0'])(a0);
var _BoolPtr___destroy___0 = Module['_BoolPtr___destroy___0'] = (a0) => (_BoolPtr___destroy___0 = Module['_BoolPtr___destroy___0'] = wasmExports['BoolPtr___destroy___0'])(a0);
var _TessResultRenderer_BeginDocument_1 = Module['_TessResultRenderer_BeginDocument_1'] = (a0, a1) => (_TessResultRenderer_BeginDocument_1 = Module['_TessResultRenderer_BeginDocument_1'] = wasmExports['TessResultRenderer_BeginDocument_1'])(a0, a1);
var _TessResultRenderer_AddImage_1 = Module['_TessResultRenderer_AddImage_1'] = (a0, a1) => (_TessResultRenderer_AddImage_1 = Module['_TessResultRenderer_AddImage_1'] = wasmExports['TessResultRenderer_AddImage_1'])(a0, a1);
var _TessResultRenderer_EndDocument_0 = Module['_TessResultRenderer_EndDocument_0'] = (a0) => (_TessResultRenderer_EndDocument_0 = Module['_TessResultRenderer_EndDocument_0'] = wasmExports['TessResultRenderer_EndDocument_0'])(a0);
var _TessResultRenderer_happy_0 = Module['_TessResultRenderer_happy_0'] = (a0) => (_TessResultRenderer_happy_0 = Module['_TessResultRenderer_happy_0'] = wasmExports['TessResultRenderer_happy_0'])(a0);
var _TessResultRenderer_file_extension_0 = Module['_TessResultRenderer_file_extension_0'] = (a0) => (_TessResultRenderer_file_extension_0 = Module['_TessResultRenderer_file_extension_0'] = wasmExports['TessResultRenderer_file_extension_0'])(a0);
var _TessResultRenderer_title_0 = Module['_TessResultRenderer_title_0'] = (a0) => (_TessResultRenderer_title_0 = Module['_TessResultRenderer_title_0'] = wasmExports['TessResultRenderer_title_0'])(a0);
var _TessResultRenderer_imagenum_0 = Module['_TessResultRenderer_imagenum_0'] = (a0) => (_TessResultRenderer_imagenum_0 = Module['_TessResultRenderer_imagenum_0'] = wasmExports['TessResultRenderer_imagenum_0'])(a0);
var _TessResultRenderer___destroy___0 = Module['_TessResultRenderer___destroy___0'] = (a0) => (_TessResultRenderer___destroy___0 = Module['_TessResultRenderer___destroy___0'] = wasmExports['TessResultRenderer___destroy___0'])(a0);
var _LongStarPtr___destroy___0 = Module['_LongStarPtr___destroy___0'] = (a0) => (_LongStarPtr___destroy___0 = Module['_LongStarPtr___destroy___0'] = wasmExports['LongStarPtr___destroy___0'])(a0);
var _VoidPtr___destroy___0 = Module['_VoidPtr___destroy___0'] = (a0) => (_VoidPtr___destroy___0 = Module['_VoidPtr___destroy___0'] = wasmExports['VoidPtr___destroy___0'])(a0);
var _ResultIterator_ResultIterator_1 = Module['_ResultIterator_ResultIterator_1'] = (a0) => (_ResultIterator_ResultIterator_1 = Module['_ResultIterator_ResultIterator_1'] = wasmExports['ResultIterator_ResultIterator_1'])(a0);
var _ResultIterator_Begin_0 = Module['_ResultIterator_Begin_0'] = (a0) => (_ResultIterator_Begin_0 = Module['_ResultIterator_Begin_0'] = wasmExports['ResultIterator_Begin_0'])(a0);
var _ResultIterator_RestartParagraph_0 = Module['_ResultIterator_RestartParagraph_0'] = (a0) => (_ResultIterator_RestartParagraph_0 = Module['_ResultIterator_RestartParagraph_0'] = wasmExports['ResultIterator_RestartParagraph_0'])(a0);
var _ResultIterator_IsWithinFirstTextlineOfParagraph_0 = Module['_ResultIterator_IsWithinFirstTextlineOfParagraph_0'] = (a0) => (_ResultIterator_IsWithinFirstTextlineOfParagraph_0 = Module['_ResultIterator_IsWithinFirstTextlineOfParagraph_0'] = wasmExports['ResultIterator_IsWithinFirstTextlineOfParagraph_0'])(a0);
var _ResultIterator_RestartRow_0 = Module['_ResultIterator_RestartRow_0'] = (a0) => (_ResultIterator_RestartRow_0 = Module['_ResultIterator_RestartRow_0'] = wasmExports['ResultIterator_RestartRow_0'])(a0);
var _ResultIterator_Next_1 = Module['_ResultIterator_Next_1'] = (a0, a1) => (_ResultIterator_Next_1 = Module['_ResultIterator_Next_1'] = wasmExports['ResultIterator_Next_1'])(a0, a1);
var _ResultIterator_IsAtBeginningOf_1 = Module['_ResultIterator_IsAtBeginningOf_1'] = (a0, a1) => (_ResultIterator_IsAtBeginningOf_1 = Module['_ResultIterator_IsAtBeginningOf_1'] = wasmExports['ResultIterator_IsAtBeginningOf_1'])(a0, a1);
var _ResultIterator_IsAtFinalElement_2 = Module['_ResultIterator_IsAtFinalElement_2'] = (a0, a1, a2) => (_ResultIterator_IsAtFinalElement_2 = Module['_ResultIterator_IsAtFinalElement_2'] = wasmExports['ResultIterator_IsAtFinalElement_2'])(a0, a1, a2);
var _ResultIterator_Cmp_1 = Module['_ResultIterator_Cmp_1'] = (a0, a1) => (_ResultIterator_Cmp_1 = Module['_ResultIterator_Cmp_1'] = wasmExports['ResultIterator_Cmp_1'])(a0, a1);
var _ResultIterator_SetBoundingBoxComponents_2 = Module['_ResultIterator_SetBoundingBoxComponents_2'] = (a0, a1, a2) => (_ResultIterator_SetBoundingBoxComponents_2 = Module['_ResultIterator_SetBoundingBoxComponents_2'] = wasmExports['ResultIterator_SetBoundingBoxComponents_2'])(a0, a1, a2);
var _ResultIterator_BoundingBox_5 = Module['_ResultIterator_BoundingBox_5'] = (a0, a1, a2, a3, a4, a5) => (_ResultIterator_BoundingBox_5 = Module['_ResultIterator_BoundingBox_5'] = wasmExports['ResultIterator_BoundingBox_5'])(a0, a1, a2, a3, a4, a5);
var _ResultIterator_BoundingBox_6 = Module['_ResultIterator_BoundingBox_6'] = (a0, a1, a2, a3, a4, a5, a6) => (_ResultIterator_BoundingBox_6 = Module['_ResultIterator_BoundingBox_6'] = wasmExports['ResultIterator_BoundingBox_6'])(a0, a1, a2, a3, a4, a5, a6);
var _ResultIterator_BoundingBoxInternal_5 = Module['_ResultIterator_BoundingBoxInternal_5'] = (a0, a1, a2, a3, a4, a5) => (_ResultIterator_BoundingBoxInternal_5 = Module['_ResultIterator_BoundingBoxInternal_5'] = wasmExports['ResultIterator_BoundingBoxInternal_5'])(a0, a1, a2, a3, a4, a5);
var _ResultIterator_Empty_1 = Module['_ResultIterator_Empty_1'] = (a0, a1) => (_ResultIterator_Empty_1 = Module['_ResultIterator_Empty_1'] = wasmExports['ResultIterator_Empty_1'])(a0, a1);
var _ResultIterator_BlockType_0 = Module['_ResultIterator_BlockType_0'] = (a0) => (_ResultIterator_BlockType_0 = Module['_ResultIterator_BlockType_0'] = wasmExports['ResultIterator_BlockType_0'])(a0);
var _ResultIterator_BlockPolygon_0 = Module['_ResultIterator_BlockPolygon_0'] = (a0) => (_ResultIterator_BlockPolygon_0 = Module['_ResultIterator_BlockPolygon_0'] = wasmExports['ResultIterator_BlockPolygon_0'])(a0);
var _ResultIterator_GetBinaryImage_1 = Module['_ResultIterator_GetBinaryImage_1'] = (a0, a1) => (_ResultIterator_GetBinaryImage_1 = Module['_ResultIterator_GetBinaryImage_1'] = wasmExports['ResultIterator_GetBinaryImage_1'])(a0, a1);
var _ResultIterator_GetImage_5 = Module['_ResultIterator_GetImage_5'] = (a0, a1, a2, a3, a4, a5) => (_ResultIterator_GetImage_5 = Module['_ResultIterator_GetImage_5'] = wasmExports['ResultIterator_GetImage_5'])(a0, a1, a2, a3, a4, a5);
var _ResultIterator_Baseline_5 = Module['_ResultIterator_Baseline_5'] = (a0, a1, a2, a3, a4, a5) => (_ResultIterator_Baseline_5 = Module['_ResultIterator_Baseline_5'] = wasmExports['ResultIterator_Baseline_5'])(a0, a1, a2, a3, a4, a5);
var _ResultIterator_Orientation_4 = Module['_ResultIterator_Orientation_4'] = (a0, a1, a2, a3, a4) => (_ResultIterator_Orientation_4 = Module['_ResultIterator_Orientation_4'] = wasmExports['ResultIterator_Orientation_4'])(a0, a1, a2, a3, a4);
var _ResultIterator_ParagraphInfo_4 = Module['_ResultIterator_ParagraphInfo_4'] = (a0, a1, a2, a3, a4) => (_ResultIterator_ParagraphInfo_4 = Module['_ResultIterator_ParagraphInfo_4'] = wasmExports['ResultIterator_ParagraphInfo_4'])(a0, a1, a2, a3, a4);
var _ResultIterator_ParagraphIsLtr_0 = Module['_ResultIterator_ParagraphIsLtr_0'] = (a0) => (_ResultIterator_ParagraphIsLtr_0 = Module['_ResultIterator_ParagraphIsLtr_0'] = wasmExports['ResultIterator_ParagraphIsLtr_0'])(a0);
var _ResultIterator_GetUTF8Text_1 = Module['_ResultIterator_GetUTF8Text_1'] = (a0, a1) => (_ResultIterator_GetUTF8Text_1 = Module['_ResultIterator_GetUTF8Text_1'] = wasmExports['ResultIterator_GetUTF8Text_1'])(a0, a1);
var _ResultIterator_SetLineSeparator_1 = Module['_ResultIterator_SetLineSeparator_1'] = (a0, a1) => (_ResultIterator_SetLineSeparator_1 = Module['_ResultIterator_SetLineSeparator_1'] = wasmExports['ResultIterator_SetLineSeparator_1'])(a0, a1);
var _ResultIterator_SetParagraphSeparator_1 = Module['_ResultIterator_SetParagraphSeparator_1'] = (a0, a1) => (_ResultIterator_SetParagraphSeparator_1 = Module['_ResultIterator_SetParagraphSeparator_1'] = wasmExports['ResultIterator_SetParagraphSeparator_1'])(a0, a1);
var _ResultIterator_Confidence_1 = Module['_ResultIterator_Confidence_1'] = (a0, a1) => (_ResultIterator_Confidence_1 = Module['_ResultIterator_Confidence_1'] = wasmExports['ResultIterator_Confidence_1'])(a0, a1);
var _ResultIterator_WordFontAttributes_8 = Module['_ResultIterator_WordFontAttributes_8'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_ResultIterator_WordFontAttributes_8 = Module['_ResultIterator_WordFontAttributes_8'] = wasmExports['ResultIterator_WordFontAttributes_8'])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
var _ResultIterator_WordRecognitionLanguage_0 = Module['_ResultIterator_WordRecognitionLanguage_0'] = (a0) => (_ResultIterator_WordRecognitionLanguage_0 = Module['_ResultIterator_WordRecognitionLanguage_0'] = wasmExports['ResultIterator_WordRecognitionLanguage_0'])(a0);
var _ResultIterator_WordDirection_0 = Module['_ResultIterator_WordDirection_0'] = (a0) => (_ResultIterator_WordDirection_0 = Module['_ResultIterator_WordDirection_0'] = wasmExports['ResultIterator_WordDirection_0'])(a0);
var _ResultIterator_WordIsFromDictionary_0 = Module['_ResultIterator_WordIsFromDictionary_0'] = (a0) => (_ResultIterator_WordIsFromDictionary_0 = Module['_ResultIterator_WordIsFromDictionary_0'] = wasmExports['ResultIterator_WordIsFromDictionary_0'])(a0);
var _ResultIterator_WordIsNumeric_0 = Module['_ResultIterator_WordIsNumeric_0'] = (a0) => (_ResultIterator_WordIsNumeric_0 = Module['_ResultIterator_WordIsNumeric_0'] = wasmExports['ResultIterator_WordIsNumeric_0'])(a0);
var _ResultIterator_HasBlamerInfo_0 = Module['_ResultIterator_HasBlamerInfo_0'] = (a0) => (_ResultIterator_HasBlamerInfo_0 = Module['_ResultIterator_HasBlamerInfo_0'] = wasmExports['ResultIterator_HasBlamerInfo_0'])(a0);
var _ResultIterator_HasTruthString_0 = Module['_ResultIterator_HasTruthString_0'] = (a0) => (_ResultIterator_HasTruthString_0 = Module['_ResultIterator_HasTruthString_0'] = wasmExports['ResultIterator_HasTruthString_0'])(a0);
var _ResultIterator_EquivalentToTruth_1 = Module['_ResultIterator_EquivalentToTruth_1'] = (a0, a1) => (_ResultIterator_EquivalentToTruth_1 = Module['_ResultIterator_EquivalentToTruth_1'] = wasmExports['ResultIterator_EquivalentToTruth_1'])(a0, a1);
var _ResultIterator_WordTruthUTF8Text_0 = Module['_ResultIterator_WordTruthUTF8Text_0'] = (a0) => (_ResultIterator_WordTruthUTF8Text_0 = Module['_ResultIterator_WordTruthUTF8Text_0'] = wasmExports['ResultIterator_WordTruthUTF8Text_0'])(a0);
var _ResultIterator_WordNormedUTF8Text_0 = Module['_ResultIterator_WordNormedUTF8Text_0'] = (a0) => (_ResultIterator_WordNormedUTF8Text_0 = Module['_ResultIterator_WordNormedUTF8Text_0'] = wasmExports['ResultIterator_WordNormedUTF8Text_0'])(a0);
var _ResultIterator_WordLattice_1 = Module['_ResultIterator_WordLattice_1'] = (a0, a1) => (_ResultIterator_WordLattice_1 = Module['_ResultIterator_WordLattice_1'] = wasmExports['ResultIterator_WordLattice_1'])(a0, a1);
var _ResultIterator_SymbolIsSuperscript_0 = Module['_ResultIterator_SymbolIsSuperscript_0'] = (a0) => (_ResultIterator_SymbolIsSuperscript_0 = Module['_ResultIterator_SymbolIsSuperscript_0'] = wasmExports['ResultIterator_SymbolIsSuperscript_0'])(a0);
var _ResultIterator_SymbolIsSubscript_0 = Module['_ResultIterator_SymbolIsSubscript_0'] = (a0) => (_ResultIterator_SymbolIsSubscript_0 = Module['_ResultIterator_SymbolIsSubscript_0'] = wasmExports['ResultIterator_SymbolIsSubscript_0'])(a0);
var _ResultIterator_SymbolIsDropcap_0 = Module['_ResultIterator_SymbolIsDropcap_0'] = (a0) => (_ResultIterator_SymbolIsDropcap_0 = Module['_ResultIterator_SymbolIsDropcap_0'] = wasmExports['ResultIterator_SymbolIsDropcap_0'])(a0);
var _ResultIterator___destroy___0 = Module['_ResultIterator___destroy___0'] = (a0) => (_ResultIterator___destroy___0 = Module['_ResultIterator___destroy___0'] = wasmExports['ResultIterator___destroy___0'])(a0);
var _TextlineOrder___destroy___0 = Module['_TextlineOrder___destroy___0'] = (a0) => (_TextlineOrder___destroy___0 = Module['_TextlineOrder___destroy___0'] = wasmExports['TextlineOrder___destroy___0'])(a0);
var _ETEXT_DESC___destroy___0 = Module['_ETEXT_DESC___destroy___0'] = (a0) => (_ETEXT_DESC___destroy___0 = Module['_ETEXT_DESC___destroy___0'] = wasmExports['ETEXT_DESC___destroy___0'])(a0);
var _PageIterator_Begin_0 = Module['_PageIterator_Begin_0'] = (a0) => (_PageIterator_Begin_0 = Module['_PageIterator_Begin_0'] = wasmExports['PageIterator_Begin_0'])(a0);
var _PageIterator_RestartParagraph_0 = Module['_PageIterator_RestartParagraph_0'] = (a0) => (_PageIterator_RestartParagraph_0 = Module['_PageIterator_RestartParagraph_0'] = wasmExports['PageIterator_RestartParagraph_0'])(a0);
var _PageIterator_IsWithinFirstTextlineOfParagraph_0 = Module['_PageIterator_IsWithinFirstTextlineOfParagraph_0'] = (a0) => (_PageIterator_IsWithinFirstTextlineOfParagraph_0 = Module['_PageIterator_IsWithinFirstTextlineOfParagraph_0'] = wasmExports['PageIterator_IsWithinFirstTextlineOfParagraph_0'])(a0);
var _PageIterator_RestartRow_0 = Module['_PageIterator_RestartRow_0'] = (a0) => (_PageIterator_RestartRow_0 = Module['_PageIterator_RestartRow_0'] = wasmExports['PageIterator_RestartRow_0'])(a0);
var _PageIterator_Next_1 = Module['_PageIterator_Next_1'] = (a0, a1) => (_PageIterator_Next_1 = Module['_PageIterator_Next_1'] = wasmExports['PageIterator_Next_1'])(a0, a1);
var _PageIterator_IsAtBeginningOf_1 = Module['_PageIterator_IsAtBeginningOf_1'] = (a0, a1) => (_PageIterator_IsAtBeginningOf_1 = Module['_PageIterator_IsAtBeginningOf_1'] = wasmExports['PageIterator_IsAtBeginningOf_1'])(a0, a1);
var _PageIterator_IsAtFinalElement_2 = Module['_PageIterator_IsAtFinalElement_2'] = (a0, a1, a2) => (_PageIterator_IsAtFinalElement_2 = Module['_PageIterator_IsAtFinalElement_2'] = wasmExports['PageIterator_IsAtFinalElement_2'])(a0, a1, a2);
var _PageIterator_Cmp_1 = Module['_PageIterator_Cmp_1'] = (a0, a1) => (_PageIterator_Cmp_1 = Module['_PageIterator_Cmp_1'] = wasmExports['PageIterator_Cmp_1'])(a0, a1);
var _PageIterator_SetBoundingBoxComponents_2 = Module['_PageIterator_SetBoundingBoxComponents_2'] = (a0, a1, a2) => (_PageIterator_SetBoundingBoxComponents_2 = Module['_PageIterator_SetBoundingBoxComponents_2'] = wasmExports['PageIterator_SetBoundingBoxComponents_2'])(a0, a1, a2);
var _PageIterator_BoundingBox_5 = Module['_PageIterator_BoundingBox_5'] = (a0, a1, a2, a3, a4, a5) => (_PageIterator_BoundingBox_5 = Module['_PageIterator_BoundingBox_5'] = wasmExports['PageIterator_BoundingBox_5'])(a0, a1, a2, a3, a4, a5);
var _PageIterator_BoundingBox_6 = Module['_PageIterator_BoundingBox_6'] = (a0, a1, a2, a3, a4, a5, a6) => (_PageIterator_BoundingBox_6 = Module['_PageIterator_BoundingBox_6'] = wasmExports['PageIterator_BoundingBox_6'])(a0, a1, a2, a3, a4, a5, a6);
var _PageIterator_BoundingBoxInternal_5 = Module['_PageIterator_BoundingBoxInternal_5'] = (a0, a1, a2, a3, a4, a5) => (_PageIterator_BoundingBoxInternal_5 = Module['_PageIterator_BoundingBoxInternal_5'] = wasmExports['PageIterator_BoundingBoxInternal_5'])(a0, a1, a2, a3, a4, a5);
var _PageIterator_Empty_1 = Module['_PageIterator_Empty_1'] = (a0, a1) => (_PageIterator_Empty_1 = Module['_PageIterator_Empty_1'] = wasmExports['PageIterator_Empty_1'])(a0, a1);
var _PageIterator_BlockType_0 = Module['_PageIterator_BlockType_0'] = (a0) => (_PageIterator_BlockType_0 = Module['_PageIterator_BlockType_0'] = wasmExports['PageIterator_BlockType_0'])(a0);
var _PageIterator_BlockPolygon_0 = Module['_PageIterator_BlockPolygon_0'] = (a0) => (_PageIterator_BlockPolygon_0 = Module['_PageIterator_BlockPolygon_0'] = wasmExports['PageIterator_BlockPolygon_0'])(a0);
var _PageIterator_GetBinaryImage_1 = Module['_PageIterator_GetBinaryImage_1'] = (a0, a1) => (_PageIterator_GetBinaryImage_1 = Module['_PageIterator_GetBinaryImage_1'] = wasmExports['PageIterator_GetBinaryImage_1'])(a0, a1);
var _PageIterator_GetImage_5 = Module['_PageIterator_GetImage_5'] = (a0, a1, a2, a3, a4, a5) => (_PageIterator_GetImage_5 = Module['_PageIterator_GetImage_5'] = wasmExports['PageIterator_GetImage_5'])(a0, a1, a2, a3, a4, a5);
var _PageIterator_Baseline_5 = Module['_PageIterator_Baseline_5'] = (a0, a1, a2, a3, a4, a5) => (_PageIterator_Baseline_5 = Module['_PageIterator_Baseline_5'] = wasmExports['PageIterator_Baseline_5'])(a0, a1, a2, a3, a4, a5);
var _PageIterator_Orientation_4 = Module['_PageIterator_Orientation_4'] = (a0, a1, a2, a3, a4) => (_PageIterator_Orientation_4 = Module['_PageIterator_Orientation_4'] = wasmExports['PageIterator_Orientation_4'])(a0, a1, a2, a3, a4);
var _PageIterator_ParagraphInfo_4 = Module['_PageIterator_ParagraphInfo_4'] = (a0, a1, a2, a3, a4) => (_PageIterator_ParagraphInfo_4 = Module['_PageIterator_ParagraphInfo_4'] = wasmExports['PageIterator_ParagraphInfo_4'])(a0, a1, a2, a3, a4);
var _PageIterator___destroy___0 = Module['_PageIterator___destroy___0'] = (a0) => (_PageIterator___destroy___0 = Module['_PageIterator___destroy___0'] = wasmExports['PageIterator___destroy___0'])(a0);
var _WritingDirection___destroy___0 = Module['_WritingDirection___destroy___0'] = (a0) => (_WritingDirection___destroy___0 = Module['_WritingDirection___destroy___0'] = wasmExports['WritingDirection___destroy___0'])(a0);
var _WordChoiceIterator_WordChoiceIterator_1 = Module['_WordChoiceIterator_WordChoiceIterator_1'] = (a0) => (_WordChoiceIterator_WordChoiceIterator_1 = Module['_WordChoiceIterator_WordChoiceIterator_1'] = wasmExports['WordChoiceIterator_WordChoiceIterator_1'])(a0);
var _WordChoiceIterator_Next_0 = Module['_WordChoiceIterator_Next_0'] = (a0) => (_WordChoiceIterator_Next_0 = Module['_WordChoiceIterator_Next_0'] = wasmExports['WordChoiceIterator_Next_0'])(a0);
var _WordChoiceIterator_GetUTF8Text_0 = Module['_WordChoiceIterator_GetUTF8Text_0'] = (a0) => (_WordChoiceIterator_GetUTF8Text_0 = Module['_WordChoiceIterator_GetUTF8Text_0'] = wasmExports['WordChoiceIterator_GetUTF8Text_0'])(a0);
var _WordChoiceIterator_Confidence_0 = Module['_WordChoiceIterator_Confidence_0'] = (a0) => (_WordChoiceIterator_Confidence_0 = Module['_WordChoiceIterator_Confidence_0'] = wasmExports['WordChoiceIterator_Confidence_0'])(a0);
var _WordChoiceIterator___destroy___0 = Module['_WordChoiceIterator___destroy___0'] = (a0) => (_WordChoiceIterator___destroy___0 = Module['_WordChoiceIterator___destroy___0'] = wasmExports['WordChoiceIterator___destroy___0'])(a0);
var _Box_get_x_0 = Module['_Box_get_x_0'] = (a0) => (_Box_get_x_0 = Module['_Box_get_x_0'] = wasmExports['Box_get_x_0'])(a0);
var _Box_get_y_0 = Module['_Box_get_y_0'] = (a0) => (_Box_get_y_0 = Module['_Box_get_y_0'] = wasmExports['Box_get_y_0'])(a0);
var _Box_get_w_0 = Module['_Box_get_w_0'] = (a0) => (_Box_get_w_0 = Module['_Box_get_w_0'] = wasmExports['Box_get_w_0'])(a0);
var _Box_get_h_0 = Module['_Box_get_h_0'] = (a0) => (_Box_get_h_0 = Module['_Box_get_h_0'] = wasmExports['Box_get_h_0'])(a0);
var _Box_get_refcount_0 = Module['_Box_get_refcount_0'] = (a0) => (_Box_get_refcount_0 = Module['_Box_get_refcount_0'] = wasmExports['Box_get_refcount_0'])(a0);
var _Box___destroy___0 = Module['_Box___destroy___0'] = (a0) => (_Box___destroy___0 = Module['_Box___destroy___0'] = wasmExports['Box___destroy___0'])(a0);
var _TessPDFRenderer_TessPDFRenderer_3 = Module['_TessPDFRenderer_TessPDFRenderer_3'] = (a0, a1, a2) => (_TessPDFRenderer_TessPDFRenderer_3 = Module['_TessPDFRenderer_TessPDFRenderer_3'] = wasmExports['TessPDFRenderer_TessPDFRenderer_3'])(a0, a1, a2);
var _TessPDFRenderer_BeginDocument_1 = Module['_TessPDFRenderer_BeginDocument_1'] = (a0, a1) => (_TessPDFRenderer_BeginDocument_1 = Module['_TessPDFRenderer_BeginDocument_1'] = wasmExports['TessPDFRenderer_BeginDocument_1'])(a0, a1);
var _TessPDFRenderer_AddImage_1 = Module['_TessPDFRenderer_AddImage_1'] = (a0, a1) => (_TessPDFRenderer_AddImage_1 = Module['_TessPDFRenderer_AddImage_1'] = wasmExports['TessPDFRenderer_AddImage_1'])(a0, a1);
var _TessPDFRenderer_EndDocument_0 = Module['_TessPDFRenderer_EndDocument_0'] = (a0) => (_TessPDFRenderer_EndDocument_0 = Module['_TessPDFRenderer_EndDocument_0'] = wasmExports['TessPDFRenderer_EndDocument_0'])(a0);
var _TessPDFRenderer_happy_0 = Module['_TessPDFRenderer_happy_0'] = (a0) => (_TessPDFRenderer_happy_0 = Module['_TessPDFRenderer_happy_0'] = wasmExports['TessPDFRenderer_happy_0'])(a0);
var _TessPDFRenderer_file_extension_0 = Module['_TessPDFRenderer_file_extension_0'] = (a0) => (_TessPDFRenderer_file_extension_0 = Module['_TessPDFRenderer_file_extension_0'] = wasmExports['TessPDFRenderer_file_extension_0'])(a0);
var _TessPDFRenderer_title_0 = Module['_TessPDFRenderer_title_0'] = (a0) => (_TessPDFRenderer_title_0 = Module['_TessPDFRenderer_title_0'] = wasmExports['TessPDFRenderer_title_0'])(a0);
var _TessPDFRenderer_imagenum_0 = Module['_TessPDFRenderer_imagenum_0'] = (a0) => (_TessPDFRenderer_imagenum_0 = Module['_TessPDFRenderer_imagenum_0'] = wasmExports['TessPDFRenderer_imagenum_0'])(a0);
var _TessPDFRenderer___destroy___0 = Module['_TessPDFRenderer___destroy___0'] = (a0) => (_TessPDFRenderer___destroy___0 = Module['_TessPDFRenderer___destroy___0'] = wasmExports['TessPDFRenderer___destroy___0'])(a0);
var _PixaPtr___destroy___0 = Module['_PixaPtr___destroy___0'] = (a0) => (_PixaPtr___destroy___0 = Module['_PixaPtr___destroy___0'] = wasmExports['PixaPtr___destroy___0'])(a0);
var _FloatPtr___destroy___0 = Module['_FloatPtr___destroy___0'] = (a0) => (_FloatPtr___destroy___0 = Module['_FloatPtr___destroy___0'] = wasmExports['FloatPtr___destroy___0'])(a0);
var _ChoiceIterator_ChoiceIterator_1 = Module['_ChoiceIterator_ChoiceIterator_1'] = (a0) => (_ChoiceIterator_ChoiceIterator_1 = Module['_ChoiceIterator_ChoiceIterator_1'] = wasmExports['ChoiceIterator_ChoiceIterator_1'])(a0);
var _ChoiceIterator_Next_0 = Module['_ChoiceIterator_Next_0'] = (a0) => (_ChoiceIterator_Next_0 = Module['_ChoiceIterator_Next_0'] = wasmExports['ChoiceIterator_Next_0'])(a0);
var _ChoiceIterator_GetUTF8Text_0 = Module['_ChoiceIterator_GetUTF8Text_0'] = (a0) => (_ChoiceIterator_GetUTF8Text_0 = Module['_ChoiceIterator_GetUTF8Text_0'] = wasmExports['ChoiceIterator_GetUTF8Text_0'])(a0);
var _ChoiceIterator_Confidence_0 = Module['_ChoiceIterator_Confidence_0'] = (a0) => (_ChoiceIterator_Confidence_0 = Module['_ChoiceIterator_Confidence_0'] = wasmExports['ChoiceIterator_Confidence_0'])(a0);
var _ChoiceIterator___destroy___0 = Module['_ChoiceIterator___destroy___0'] = (a0) => (_ChoiceIterator___destroy___0 = Module['_ChoiceIterator___destroy___0'] = wasmExports['ChoiceIterator___destroy___0'])(a0);
var _PixPtr___destroy___0 = Module['_PixPtr___destroy___0'] = (a0) => (_PixPtr___destroy___0 = Module['_PixPtr___destroy___0'] = wasmExports['PixPtr___destroy___0'])(a0);
var _UNICHARSET_get_script_from_script_id_1 = Module['_UNICHARSET_get_script_from_script_id_1'] = (a0, a1) => (_UNICHARSET_get_script_from_script_id_1 = Module['_UNICHARSET_get_script_from_script_id_1'] = wasmExports['UNICHARSET_get_script_from_script_id_1'])(a0, a1);
var _UNICHARSET_get_script_id_from_name_1 = Module['_UNICHARSET_get_script_id_from_name_1'] = (a0, a1) => (_UNICHARSET_get_script_id_from_name_1 = Module['_UNICHARSET_get_script_id_from_name_1'] = wasmExports['UNICHARSET_get_script_id_from_name_1'])(a0, a1);
var _UNICHARSET_get_script_table_size_0 = Module['_UNICHARSET_get_script_table_size_0'] = (a0) => (_UNICHARSET_get_script_table_size_0 = Module['_UNICHARSET_get_script_table_size_0'] = wasmExports['UNICHARSET_get_script_table_size_0'])(a0);
var _UNICHARSET___destroy___0 = Module['_UNICHARSET___destroy___0'] = (a0) => (_UNICHARSET___destroy___0 = Module['_UNICHARSET___destroy___0'] = wasmExports['UNICHARSET___destroy___0'])(a0);
var _IntPtr___destroy___0 = Module['_IntPtr___destroy___0'] = (a0) => (_IntPtr___destroy___0 = Module['_IntPtr___destroy___0'] = wasmExports['IntPtr___destroy___0'])(a0);
var _Orientation___destroy___0 = Module['_Orientation___destroy___0'] = (a0) => (_Orientation___destroy___0 = Module['_Orientation___destroy___0'] = wasmExports['Orientation___destroy___0'])(a0);
var _OSBestResult_get_orientation_id_0 = Module['_OSBestResult_get_orientation_id_0'] = (a0) => (_OSBestResult_get_orientation_id_0 = Module['_OSBestResult_get_orientation_id_0'] = wasmExports['OSBestResult_get_orientation_id_0'])(a0);
var _OSBestResult_get_script_id_0 = Module['_OSBestResult_get_script_id_0'] = (a0) => (_OSBestResult_get_script_id_0 = Module['_OSBestResult_get_script_id_0'] = wasmExports['OSBestResult_get_script_id_0'])(a0);
var _OSBestResult_get_sconfidence_0 = Module['_OSBestResult_get_sconfidence_0'] = (a0) => (_OSBestResult_get_sconfidence_0 = Module['_OSBestResult_get_sconfidence_0'] = wasmExports['OSBestResult_get_sconfidence_0'])(a0);
var _OSBestResult_get_oconfidence_0 = Module['_OSBestResult_get_oconfidence_0'] = (a0) => (_OSBestResult_get_oconfidence_0 = Module['_OSBestResult_get_oconfidence_0'] = wasmExports['OSBestResult_get_oconfidence_0'])(a0);
var _OSBestResult___destroy___0 = Module['_OSBestResult___destroy___0'] = (a0) => (_OSBestResult___destroy___0 = Module['_OSBestResult___destroy___0'] = wasmExports['OSBestResult___destroy___0'])(a0);
var _Boxa_get_n_0 = Module['_Boxa_get_n_0'] = (a0) => (_Boxa_get_n_0 = Module['_Boxa_get_n_0'] = wasmExports['Boxa_get_n_0'])(a0);
var _Boxa_get_nalloc_0 = Module['_Boxa_get_nalloc_0'] = (a0) => (_Boxa_get_nalloc_0 = Module['_Boxa_get_nalloc_0'] = wasmExports['Boxa_get_nalloc_0'])(a0);
var _Boxa_get_refcount_0 = Module['_Boxa_get_refcount_0'] = (a0) => (_Boxa_get_refcount_0 = Module['_Boxa_get_refcount_0'] = wasmExports['Boxa_get_refcount_0'])(a0);
var _Boxa_get_box_0 = Module['_Boxa_get_box_0'] = (a0) => (_Boxa_get_box_0 = Module['_Boxa_get_box_0'] = wasmExports['Boxa_get_box_0'])(a0);
var _Boxa___destroy___0 = Module['_Boxa___destroy___0'] = (a0) => (_Boxa___destroy___0 = Module['_Boxa___destroy___0'] = wasmExports['Boxa___destroy___0'])(a0);
var _PixColormap_get_array_0 = Module['_PixColormap_get_array_0'] = (a0) => (_PixColormap_get_array_0 = Module['_PixColormap_get_array_0'] = wasmExports['PixColormap_get_array_0'])(a0);
var _PixColormap_get_depth_0 = Module['_PixColormap_get_depth_0'] = (a0) => (_PixColormap_get_depth_0 = Module['_PixColormap_get_depth_0'] = wasmExports['PixColormap_get_depth_0'])(a0);
var _PixColormap_get_nalloc_0 = Module['_PixColormap_get_nalloc_0'] = (a0) => (_PixColormap_get_nalloc_0 = Module['_PixColormap_get_nalloc_0'] = wasmExports['PixColormap_get_nalloc_0'])(a0);
var _PixColormap_get_n_0 = Module['_PixColormap_get_n_0'] = (a0) => (_PixColormap_get_n_0 = Module['_PixColormap_get_n_0'] = wasmExports['PixColormap_get_n_0'])(a0);
var _PixColormap___destroy___0 = Module['_PixColormap___destroy___0'] = (a0) => (_PixColormap___destroy___0 = Module['_PixColormap___destroy___0'] = wasmExports['PixColormap___destroy___0'])(a0);
var _Pta_get_n_0 = Module['_Pta_get_n_0'] = (a0) => (_Pta_get_n_0 = Module['_Pta_get_n_0'] = wasmExports['Pta_get_n_0'])(a0);
var _Pta_get_nalloc_0 = Module['_Pta_get_nalloc_0'] = (a0) => (_Pta_get_nalloc_0 = Module['_Pta_get_nalloc_0'] = wasmExports['Pta_get_nalloc_0'])(a0);
var _Pta_get_refcount_0 = Module['_Pta_get_refcount_0'] = (a0) => (_Pta_get_refcount_0 = Module['_Pta_get_refcount_0'] = wasmExports['Pta_get_refcount_0'])(a0);
var _Pta_get_x_0 = Module['_Pta_get_x_0'] = (a0) => (_Pta_get_x_0 = Module['_Pta_get_x_0'] = wasmExports['Pta_get_x_0'])(a0);
var _Pta_get_y_0 = Module['_Pta_get_y_0'] = (a0) => (_Pta_get_y_0 = Module['_Pta_get_y_0'] = wasmExports['Pta_get_y_0'])(a0);
var _Pta___destroy___0 = Module['_Pta___destroy___0'] = (a0) => (_Pta___destroy___0 = Module['_Pta___destroy___0'] = wasmExports['Pta___destroy___0'])(a0);
var _Pix_get_w_0 = Module['_Pix_get_w_0'] = (a0) => (_Pix_get_w_0 = Module['_Pix_get_w_0'] = wasmExports['Pix_get_w_0'])(a0);
var _Pix_get_h_0 = Module['_Pix_get_h_0'] = (a0) => (_Pix_get_h_0 = Module['_Pix_get_h_0'] = wasmExports['Pix_get_h_0'])(a0);
var _Pix_get_d_0 = Module['_Pix_get_d_0'] = (a0) => (_Pix_get_d_0 = Module['_Pix_get_d_0'] = wasmExports['Pix_get_d_0'])(a0);
var _Pix_get_spp_0 = Module['_Pix_get_spp_0'] = (a0) => (_Pix_get_spp_0 = Module['_Pix_get_spp_0'] = wasmExports['Pix_get_spp_0'])(a0);
var _Pix_get_wpl_0 = Module['_Pix_get_wpl_0'] = (a0) => (_Pix_get_wpl_0 = Module['_Pix_get_wpl_0'] = wasmExports['Pix_get_wpl_0'])(a0);
var _Pix_get_refcount_0 = Module['_Pix_get_refcount_0'] = (a0) => (_Pix_get_refcount_0 = Module['_Pix_get_refcount_0'] = wasmExports['Pix_get_refcount_0'])(a0);
var _Pix_get_xres_0 = Module['_Pix_get_xres_0'] = (a0) => (_Pix_get_xres_0 = Module['_Pix_get_xres_0'] = wasmExports['Pix_get_xres_0'])(a0);
var _Pix_get_yres_0 = Module['_Pix_get_yres_0'] = (a0) => (_Pix_get_yres_0 = Module['_Pix_get_yres_0'] = wasmExports['Pix_get_yres_0'])(a0);
var _Pix_get_informat_0 = Module['_Pix_get_informat_0'] = (a0) => (_Pix_get_informat_0 = Module['_Pix_get_informat_0'] = wasmExports['Pix_get_informat_0'])(a0);
var _Pix_get_special_0 = Module['_Pix_get_special_0'] = (a0) => (_Pix_get_special_0 = Module['_Pix_get_special_0'] = wasmExports['Pix_get_special_0'])(a0);
var _Pix_get_text_0 = Module['_Pix_get_text_0'] = (a0) => (_Pix_get_text_0 = Module['_Pix_get_text_0'] = wasmExports['Pix_get_text_0'])(a0);
var _Pix_get_colormap_0 = Module['_Pix_get_colormap_0'] = (a0) => (_Pix_get_colormap_0 = Module['_Pix_get_colormap_0'] = wasmExports['Pix_get_colormap_0'])(a0);
var _Pix_get_data_0 = Module['_Pix_get_data_0'] = (a0) => (_Pix_get_data_0 = Module['_Pix_get_data_0'] = wasmExports['Pix_get_data_0'])(a0);
var _Pix___destroy___0 = Module['_Pix___destroy___0'] = (a0) => (_Pix___destroy___0 = Module['_Pix___destroy___0'] = wasmExports['Pix___destroy___0'])(a0);
var _DoublePtr___destroy___0 = Module['_DoublePtr___destroy___0'] = (a0) => (_DoublePtr___destroy___0 = Module['_DoublePtr___destroy___0'] = wasmExports['DoublePtr___destroy___0'])(a0);
var _Dawg___destroy___0 = Module['_Dawg___destroy___0'] = (a0) => (_Dawg___destroy___0 = Module['_Dawg___destroy___0'] = wasmExports['Dawg___destroy___0'])(a0);
var _BoxPtr___destroy___0 = Module['_BoxPtr___destroy___0'] = (a0) => (_BoxPtr___destroy___0 = Module['_BoxPtr___destroy___0'] = wasmExports['BoxPtr___destroy___0'])(a0);
var _TessBaseAPI_TessBaseAPI_0 = Module['_TessBaseAPI_TessBaseAPI_0'] = () => (_TessBaseAPI_TessBaseAPI_0 = Module['_TessBaseAPI_TessBaseAPI_0'] = wasmExports['TessBaseAPI_TessBaseAPI_0'])();
var _TessBaseAPI_Version_0 = Module['_TessBaseAPI_Version_0'] = (a0) => (_TessBaseAPI_Version_0 = Module['_TessBaseAPI_Version_0'] = wasmExports['TessBaseAPI_Version_0'])(a0);
var _TessBaseAPI_SetInputName_1 = Module['_TessBaseAPI_SetInputName_1'] = (a0, a1) => (_TessBaseAPI_SetInputName_1 = Module['_TessBaseAPI_SetInputName_1'] = wasmExports['TessBaseAPI_SetInputName_1'])(a0, a1);
var _TessBaseAPI_GetInputName_0 = Module['_TessBaseAPI_GetInputName_0'] = (a0) => (_TessBaseAPI_GetInputName_0 = Module['_TessBaseAPI_GetInputName_0'] = wasmExports['TessBaseAPI_GetInputName_0'])(a0);
var _TessBaseAPI_SetInputImage_1 = Module['_TessBaseAPI_SetInputImage_1'] = (a0, a1) => (_TessBaseAPI_SetInputImage_1 = Module['_TessBaseAPI_SetInputImage_1'] = wasmExports['TessBaseAPI_SetInputImage_1'])(a0, a1);
var _TessBaseAPI_GetInputImage_0 = Module['_TessBaseAPI_GetInputImage_0'] = (a0) => (_TessBaseAPI_GetInputImage_0 = Module['_TessBaseAPI_GetInputImage_0'] = wasmExports['TessBaseAPI_GetInputImage_0'])(a0);
var _TessBaseAPI_GetSourceYResolution_0 = Module['_TessBaseAPI_GetSourceYResolution_0'] = (a0) => (_TessBaseAPI_GetSourceYResolution_0 = Module['_TessBaseAPI_GetSourceYResolution_0'] = wasmExports['TessBaseAPI_GetSourceYResolution_0'])(a0);
var _TessBaseAPI_GetDatapath_0 = Module['_TessBaseAPI_GetDatapath_0'] = (a0) => (_TessBaseAPI_GetDatapath_0 = Module['_TessBaseAPI_GetDatapath_0'] = wasmExports['TessBaseAPI_GetDatapath_0'])(a0);
var _TessBaseAPI_SetOutputName_1 = Module['_TessBaseAPI_SetOutputName_1'] = (a0, a1) => (_TessBaseAPI_SetOutputName_1 = Module['_TessBaseAPI_SetOutputName_1'] = wasmExports['TessBaseAPI_SetOutputName_1'])(a0, a1);
var _TessBaseAPI_SetVariable_2 = Module['_TessBaseAPI_SetVariable_2'] = (a0, a1, a2) => (_TessBaseAPI_SetVariable_2 = Module['_TessBaseAPI_SetVariable_2'] = wasmExports['TessBaseAPI_SetVariable_2'])(a0, a1, a2);
var _TessBaseAPI_SetDebugVariable_2 = Module['_TessBaseAPI_SetDebugVariable_2'] = (a0, a1, a2) => (_TessBaseAPI_SetDebugVariable_2 = Module['_TessBaseAPI_SetDebugVariable_2'] = wasmExports['TessBaseAPI_SetDebugVariable_2'])(a0, a1, a2);
var _TessBaseAPI_GetIntVariable_2 = Module['_TessBaseAPI_GetIntVariable_2'] = (a0, a1, a2) => (_TessBaseAPI_GetIntVariable_2 = Module['_TessBaseAPI_GetIntVariable_2'] = wasmExports['TessBaseAPI_GetIntVariable_2'])(a0, a1, a2);
var _TessBaseAPI_GetBoolVariable_2 = Module['_TessBaseAPI_GetBoolVariable_2'] = (a0, a1, a2) => (_TessBaseAPI_GetBoolVariable_2 = Module['_TessBaseAPI_GetBoolVariable_2'] = wasmExports['TessBaseAPI_GetBoolVariable_2'])(a0, a1, a2);
var _TessBaseAPI_GetDoubleVariable_2 = Module['_TessBaseAPI_GetDoubleVariable_2'] = (a0, a1, a2) => (_TessBaseAPI_GetDoubleVariable_2 = Module['_TessBaseAPI_GetDoubleVariable_2'] = wasmExports['TessBaseAPI_GetDoubleVariable_2'])(a0, a1, a2);
var _TessBaseAPI_GetStringVariable_1 = Module['_TessBaseAPI_GetStringVariable_1'] = (a0, a1) => (_TessBaseAPI_GetStringVariable_1 = Module['_TessBaseAPI_GetStringVariable_1'] = wasmExports['TessBaseAPI_GetStringVariable_1'])(a0, a1);
var _TessBaseAPI_SaveParameters_1 = Module['_TessBaseAPI_SaveParameters_1'] = (a0) => (_TessBaseAPI_SaveParameters_1 = Module['_TessBaseAPI_SaveParameters_1'] = wasmExports['TessBaseAPI_SaveParameters_1'])(a0);
var _TessBaseAPI_RestoreParameters_1 = Module['_TessBaseAPI_RestoreParameters_1'] = (a0) => (_TessBaseAPI_RestoreParameters_1 = Module['_TessBaseAPI_RestoreParameters_1'] = wasmExports['TessBaseAPI_RestoreParameters_1'])(a0);
var _TessBaseAPI_Init_2 = Module['_TessBaseAPI_Init_2'] = (a0, a1, a2) => (_TessBaseAPI_Init_2 = Module['_TessBaseAPI_Init_2'] = wasmExports['TessBaseAPI_Init_2'])(a0, a1, a2);
var _TessBaseAPI_Init_3 = Module['_TessBaseAPI_Init_3'] = (a0, a1, a2, a3) => (_TessBaseAPI_Init_3 = Module['_TessBaseAPI_Init_3'] = wasmExports['TessBaseAPI_Init_3'])(a0, a1, a2, a3);
var _TessBaseAPI_Init_4 = Module['_TessBaseAPI_Init_4'] = (a0, a1, a2, a3, a4) => (_TessBaseAPI_Init_4 = Module['_TessBaseAPI_Init_4'] = wasmExports['TessBaseAPI_Init_4'])(a0, a1, a2, a3, a4);
var _TessBaseAPI_GetInitLanguagesAsString_0 = Module['_TessBaseAPI_GetInitLanguagesAsString_0'] = (a0) => (_TessBaseAPI_GetInitLanguagesAsString_0 = Module['_TessBaseAPI_GetInitLanguagesAsString_0'] = wasmExports['TessBaseAPI_GetInitLanguagesAsString_0'])(a0);
var _TessBaseAPI_InitForAnalysePage_0 = Module['_TessBaseAPI_InitForAnalysePage_0'] = (a0) => (_TessBaseAPI_InitForAnalysePage_0 = Module['_TessBaseAPI_InitForAnalysePage_0'] = wasmExports['TessBaseAPI_InitForAnalysePage_0'])(a0);
var _TessBaseAPI_ReadConfigFile_1 = Module['_TessBaseAPI_ReadConfigFile_1'] = (a0, a1) => (_TessBaseAPI_ReadConfigFile_1 = Module['_TessBaseAPI_ReadConfigFile_1'] = wasmExports['TessBaseAPI_ReadConfigFile_1'])(a0, a1);
var _TessBaseAPI_ReadDebugConfigFile_1 = Module['_TessBaseAPI_ReadDebugConfigFile_1'] = (a0, a1) => (_TessBaseAPI_ReadDebugConfigFile_1 = Module['_TessBaseAPI_ReadDebugConfigFile_1'] = wasmExports['TessBaseAPI_ReadDebugConfigFile_1'])(a0, a1);
var _TessBaseAPI_SetPageSegMode_1 = Module['_TessBaseAPI_SetPageSegMode_1'] = (a0, a1) => (_TessBaseAPI_SetPageSegMode_1 = Module['_TessBaseAPI_SetPageSegMode_1'] = wasmExports['TessBaseAPI_SetPageSegMode_1'])(a0, a1);
var _TessBaseAPI_GetPageSegMode_0 = Module['_TessBaseAPI_GetPageSegMode_0'] = (a0) => (_TessBaseAPI_GetPageSegMode_0 = Module['_TessBaseAPI_GetPageSegMode_0'] = wasmExports['TessBaseAPI_GetPageSegMode_0'])(a0);
var _TessBaseAPI_TesseractRect_7 = Module['_TessBaseAPI_TesseractRect_7'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_TessBaseAPI_TesseractRect_7 = Module['_TessBaseAPI_TesseractRect_7'] = wasmExports['TessBaseAPI_TesseractRect_7'])(a0, a1, a2, a3, a4, a5, a6, a7);
var _TessBaseAPI_ParseImage = Module['_TessBaseAPI_ParseImage'] = (a0, a1, a2, a3, a4) => (_TessBaseAPI_ParseImage = Module['_TessBaseAPI_ParseImage'] = wasmExports['TessBaseAPI_ParseImage'])(a0, a1, a2, a3, a4);
var _pixReadMem = Module['_pixReadMem'] = (a0, a1) => (_pixReadMem = Module['_pixReadMem'] = wasmExports['pixReadMem'])(a0, a1);
var _pixDestroy = Module['_pixDestroy'] = (a0) => (_pixDestroy = Module['_pixDestroy'] = wasmExports['pixDestroy'])(a0);
var _free = Module['_free'] = (a0) => (_free = Module['_free'] = wasmExports['free'])(a0);
var _TessBaseAPI_SetImage_1 = Module['_TessBaseAPI_SetImage_1'] = (a0, a1, a2, a3) => (_TessBaseAPI_SetImage_1 = Module['_TessBaseAPI_SetImage_1'] = wasmExports['TessBaseAPI_SetImage_1'])(a0, a1, a2, a3);
var _TessBaseAPI_SetImage_5 = Module['_TessBaseAPI_SetImage_5'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_TessBaseAPI_SetImage_5 = Module['_TessBaseAPI_SetImage_5'] = wasmExports['TessBaseAPI_SetImage_5'])(a0, a1, a2, a3, a4, a5, a6, a7);
var _TessBaseAPI_SetSourceResolution_1 = Module['_TessBaseAPI_SetSourceResolution_1'] = (a0, a1) => (_TessBaseAPI_SetSourceResolution_1 = Module['_TessBaseAPI_SetSourceResolution_1'] = wasmExports['TessBaseAPI_SetSourceResolution_1'])(a0, a1);
var _TessBaseAPI_SetRectangle_4 = Module['_TessBaseAPI_SetRectangle_4'] = (a0, a1, a2, a3, a4) => (_TessBaseAPI_SetRectangle_4 = Module['_TessBaseAPI_SetRectangle_4'] = wasmExports['TessBaseAPI_SetRectangle_4'])(a0, a1, a2, a3, a4);
var _TessBaseAPI_GetThresholdedImage_0 = Module['_TessBaseAPI_GetThresholdedImage_0'] = (a0) => (_TessBaseAPI_GetThresholdedImage_0 = Module['_TessBaseAPI_GetThresholdedImage_0'] = wasmExports['TessBaseAPI_GetThresholdedImage_0'])(a0);
var _TessBaseAPI_WriteImage_0 = Module['_TessBaseAPI_WriteImage_0'] = (a0, a1) => (_TessBaseAPI_WriteImage_0 = Module['_TessBaseAPI_WriteImage_0'] = wasmExports['TessBaseAPI_WriteImage_0'])(a0, a1);
var _TessBaseAPI_FindLines_0 = Module['_TessBaseAPI_FindLines_0'] = (a0) => (_TessBaseAPI_FindLines_0 = Module['_TessBaseAPI_FindLines_0'] = wasmExports['TessBaseAPI_FindLines_0'])(a0);
var _TessBaseAPI_GetGradient_0 = Module['_TessBaseAPI_GetGradient_0'] = (a0) => (_TessBaseAPI_GetGradient_0 = Module['_TessBaseAPI_GetGradient_0'] = wasmExports['TessBaseAPI_GetGradient_0'])(a0);
var _TessBaseAPI_GetRegions_1 = Module['_TessBaseAPI_GetRegions_1'] = (a0, a1) => (_TessBaseAPI_GetRegions_1 = Module['_TessBaseAPI_GetRegions_1'] = wasmExports['TessBaseAPI_GetRegions_1'])(a0, a1);
var _TessBaseAPI_GetTextlines_2 = Module['_TessBaseAPI_GetTextlines_2'] = (a0, a1, a2) => (_TessBaseAPI_GetTextlines_2 = Module['_TessBaseAPI_GetTextlines_2'] = wasmExports['TessBaseAPI_GetTextlines_2'])(a0, a1, a2);
var _TessBaseAPI_GetTextlines_5 = Module['_TessBaseAPI_GetTextlines_5'] = (a0, a1, a2, a3, a4, a5) => (_TessBaseAPI_GetTextlines_5 = Module['_TessBaseAPI_GetTextlines_5'] = wasmExports['TessBaseAPI_GetTextlines_5'])(a0, a1, a2, a3, a4, a5);
var _TessBaseAPI_GetStrips_2 = Module['_TessBaseAPI_GetStrips_2'] = (a0, a1, a2) => (_TessBaseAPI_GetStrips_2 = Module['_TessBaseAPI_GetStrips_2'] = wasmExports['TessBaseAPI_GetStrips_2'])(a0, a1, a2);
var _TessBaseAPI_GetWords_1 = Module['_TessBaseAPI_GetWords_1'] = (a0, a1) => (_TessBaseAPI_GetWords_1 = Module['_TessBaseAPI_GetWords_1'] = wasmExports['TessBaseAPI_GetWords_1'])(a0, a1);
var _TessBaseAPI_GetConnectedComponents_1 = Module['_TessBaseAPI_GetConnectedComponents_1'] = (a0, a1) => (_TessBaseAPI_GetConnectedComponents_1 = Module['_TessBaseAPI_GetConnectedComponents_1'] = wasmExports['TessBaseAPI_GetConnectedComponents_1'])(a0, a1);
var _TessBaseAPI_GetComponentImages_4 = Module['_TessBaseAPI_GetComponentImages_4'] = (a0, a1, a2, a3, a4) => (_TessBaseAPI_GetComponentImages_4 = Module['_TessBaseAPI_GetComponentImages_4'] = wasmExports['TessBaseAPI_GetComponentImages_4'])(a0, a1, a2, a3, a4);
var _TessBaseAPI_GetComponentImages_7 = Module['_TessBaseAPI_GetComponentImages_7'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_TessBaseAPI_GetComponentImages_7 = Module['_TessBaseAPI_GetComponentImages_7'] = wasmExports['TessBaseAPI_GetComponentImages_7'])(a0, a1, a2, a3, a4, a5, a6, a7);
var _TessBaseAPI_GetThresholdedImageScaleFactor_0 = Module['_TessBaseAPI_GetThresholdedImageScaleFactor_0'] = (a0) => (_TessBaseAPI_GetThresholdedImageScaleFactor_0 = Module['_TessBaseAPI_GetThresholdedImageScaleFactor_0'] = wasmExports['TessBaseAPI_GetThresholdedImageScaleFactor_0'])(a0);
var _TessBaseAPI_AnalyseLayout_0 = Module['_TessBaseAPI_AnalyseLayout_0'] = (a0) => (_TessBaseAPI_AnalyseLayout_0 = Module['_TessBaseAPI_AnalyseLayout_0'] = wasmExports['TessBaseAPI_AnalyseLayout_0'])(a0);
var _TessBaseAPI_AnalyseLayout_1 = Module['_TessBaseAPI_AnalyseLayout_1'] = (a0, a1) => (_TessBaseAPI_AnalyseLayout_1 = Module['_TessBaseAPI_AnalyseLayout_1'] = wasmExports['TessBaseAPI_AnalyseLayout_1'])(a0, a1);
var _TessBaseAPI_Recognize_1 = Module['_TessBaseAPI_Recognize_1'] = (a0, a1) => (_TessBaseAPI_Recognize_1 = Module['_TessBaseAPI_Recognize_1'] = wasmExports['TessBaseAPI_Recognize_1'])(a0, a1);
var _TessBaseAPI_ProcessPages_4 = Module['_TessBaseAPI_ProcessPages_4'] = (a0, a1, a2, a3, a4) => (_TessBaseAPI_ProcessPages_4 = Module['_TessBaseAPI_ProcessPages_4'] = wasmExports['TessBaseAPI_ProcessPages_4'])(a0, a1, a2, a3, a4);
var _TessBaseAPI_ProcessPage_6 = Module['_TessBaseAPI_ProcessPage_6'] = (a0, a1, a2, a3, a4, a5, a6) => (_TessBaseAPI_ProcessPage_6 = Module['_TessBaseAPI_ProcessPage_6'] = wasmExports['TessBaseAPI_ProcessPage_6'])(a0, a1, a2, a3, a4, a5, a6);
var _TessBaseAPI_GetIterator_0 = Module['_TessBaseAPI_GetIterator_0'] = (a0) => (_TessBaseAPI_GetIterator_0 = Module['_TessBaseAPI_GetIterator_0'] = wasmExports['TessBaseAPI_GetIterator_0'])(a0);
var _TessBaseAPI_GetUTF8Text_0 = Module['_TessBaseAPI_GetUTF8Text_0'] = (a0) => (_TessBaseAPI_GetUTF8Text_0 = Module['_TessBaseAPI_GetUTF8Text_0'] = wasmExports['TessBaseAPI_GetUTF8Text_0'])(a0);
var _TessBaseAPI_GetHOCRText_1 = Module['_TessBaseAPI_GetHOCRText_1'] = (a0, a1) => (_TessBaseAPI_GetHOCRText_1 = Module['_TessBaseAPI_GetHOCRText_1'] = wasmExports['TessBaseAPI_GetHOCRText_1'])(a0, a1);
var _TessBaseAPI_GetTSVText_1 = Module['_TessBaseAPI_GetTSVText_1'] = (a0, a1) => (_TessBaseAPI_GetTSVText_1 = Module['_TessBaseAPI_GetTSVText_1'] = wasmExports['TessBaseAPI_GetTSVText_1'])(a0, a1);
var _TessBaseAPI_GetBoxText_1 = Module['_TessBaseAPI_GetBoxText_1'] = (a0, a1) => (_TessBaseAPI_GetBoxText_1 = Module['_TessBaseAPI_GetBoxText_1'] = wasmExports['TessBaseAPI_GetBoxText_1'])(a0, a1);
var _TessBaseAPI_GetUNLVText_0 = Module['_TessBaseAPI_GetUNLVText_0'] = (a0) => (_TessBaseAPI_GetUNLVText_0 = Module['_TessBaseAPI_GetUNLVText_0'] = wasmExports['TessBaseAPI_GetUNLVText_0'])(a0);
var _TessBaseAPI_MeanTextConf_0 = Module['_TessBaseAPI_MeanTextConf_0'] = (a0) => (_TessBaseAPI_MeanTextConf_0 = Module['_TessBaseAPI_MeanTextConf_0'] = wasmExports['TessBaseAPI_MeanTextConf_0'])(a0);
var _TessBaseAPI_AllWordConfidences_0 = Module['_TessBaseAPI_AllWordConfidences_0'] = (a0) => (_TessBaseAPI_AllWordConfidences_0 = Module['_TessBaseAPI_AllWordConfidences_0'] = wasmExports['TessBaseAPI_AllWordConfidences_0'])(a0);
var _TessBaseAPI_Clear_0 = Module['_TessBaseAPI_Clear_0'] = (a0) => (_TessBaseAPI_Clear_0 = Module['_TessBaseAPI_Clear_0'] = wasmExports['TessBaseAPI_Clear_0'])(a0);
var _TessBaseAPI_End_0 = Module['_TessBaseAPI_End_0'] = (a0) => (_TessBaseAPI_End_0 = Module['_TessBaseAPI_End_0'] = wasmExports['TessBaseAPI_End_0'])(a0);
var _TessBaseAPI_ClearPersistentCache_0 = Module['_TessBaseAPI_ClearPersistentCache_0'] = (a0) => (_TessBaseAPI_ClearPersistentCache_0 = Module['_TessBaseAPI_ClearPersistentCache_0'] = wasmExports['TessBaseAPI_ClearPersistentCache_0'])(a0);
var _TessBaseAPI_IsValidWord_1 = Module['_TessBaseAPI_IsValidWord_1'] = (a0, a1) => (_TessBaseAPI_IsValidWord_1 = Module['_TessBaseAPI_IsValidWord_1'] = wasmExports['TessBaseAPI_IsValidWord_1'])(a0, a1);
var _TessBaseAPI_IsValidCharacter_1 = Module['_TessBaseAPI_IsValidCharacter_1'] = (a0, a1) => (_TessBaseAPI_IsValidCharacter_1 = Module['_TessBaseAPI_IsValidCharacter_1'] = wasmExports['TessBaseAPI_IsValidCharacter_1'])(a0, a1);
var _TessBaseAPI_GetUnichar_1 = Module['_TessBaseAPI_GetUnichar_1'] = (a0, a1) => (_TessBaseAPI_GetUnichar_1 = Module['_TessBaseAPI_GetUnichar_1'] = wasmExports['TessBaseAPI_GetUnichar_1'])(a0, a1);
var _TessBaseAPI_GetDawg_1 = Module['_TessBaseAPI_GetDawg_1'] = (a0, a1) => (_TessBaseAPI_GetDawg_1 = Module['_TessBaseAPI_GetDawg_1'] = wasmExports['TessBaseAPI_GetDawg_1'])(a0, a1);
var _TessBaseAPI_NumDawgs_0 = Module['_TessBaseAPI_NumDawgs_0'] = (a0) => (_TessBaseAPI_NumDawgs_0 = Module['_TessBaseAPI_NumDawgs_0'] = wasmExports['TessBaseAPI_NumDawgs_0'])(a0);
var _TessBaseAPI_oem_0 = Module['_TessBaseAPI_oem_0'] = (a0) => (_TessBaseAPI_oem_0 = Module['_TessBaseAPI_oem_0'] = wasmExports['TessBaseAPI_oem_0'])(a0);
var _TessBaseAPI___destroy___0 = Module['_TessBaseAPI___destroy___0'] = (a0) => (_TessBaseAPI___destroy___0 = Module['_TessBaseAPI___destroy___0'] = wasmExports['TessBaseAPI___destroy___0'])(a0);
var _OSResults_OSResults_0 = Module['_OSResults_OSResults_0'] = () => (_OSResults_OSResults_0 = Module['_OSResults_OSResults_0'] = wasmExports['OSResults_OSResults_0'])();
var _OSResults_get_best_result_0 = Module['_OSResults_get_best_result_0'] = (a0) => (_OSResults_get_best_result_0 = Module['_OSResults_get_best_result_0'] = wasmExports['OSResults_get_best_result_0'])(a0);
var _OSResults_get_unicharset_0 = Module['_OSResults_get_unicharset_0'] = (a0) => (_OSResults_get_unicharset_0 = Module['_OSResults_get_unicharset_0'] = wasmExports['OSResults_get_unicharset_0'])(a0);
var _OSResults___destroy___0 = Module['_OSResults___destroy___0'] = (a0) => (_OSResults___destroy___0 = Module['_OSResults___destroy___0'] = wasmExports['OSResults___destroy___0'])(a0);
var _Pixa_get_n_0 = Module['_Pixa_get_n_0'] = (a0) => (_Pixa_get_n_0 = Module['_Pixa_get_n_0'] = wasmExports['Pixa_get_n_0'])(a0);
var _Pixa_get_nalloc_0 = Module['_Pixa_get_nalloc_0'] = (a0) => (_Pixa_get_nalloc_0 = Module['_Pixa_get_nalloc_0'] = wasmExports['Pixa_get_nalloc_0'])(a0);
var _Pixa_get_refcount_0 = Module['_Pixa_get_refcount_0'] = (a0) => (_Pixa_get_refcount_0 = Module['_Pixa_get_refcount_0'] = wasmExports['Pixa_get_refcount_0'])(a0);
var _Pixa_get_pix_0 = Module['_Pixa_get_pix_0'] = (a0) => (_Pixa_get_pix_0 = Module['_Pixa_get_pix_0'] = wasmExports['Pixa_get_pix_0'])(a0);
var _Pixa_get_boxa_0 = Module['_Pixa_get_boxa_0'] = (a0) => (_Pixa_get_boxa_0 = Module['_Pixa_get_boxa_0'] = wasmExports['Pixa_get_boxa_0'])(a0);
var _Pixa___destroy___0 = Module['_Pixa___destroy___0'] = (a0) => (_Pixa___destroy___0 = Module['_Pixa___destroy___0'] = wasmExports['Pixa___destroy___0'])(a0);
var _emscripten_enum_PageIteratorLevel_RIL_BLOCK = Module['_emscripten_enum_PageIteratorLevel_RIL_BLOCK'] = () => (_emscripten_enum_PageIteratorLevel_RIL_BLOCK = Module['_emscripten_enum_PageIteratorLevel_RIL_BLOCK'] = wasmExports['emscripten_enum_PageIteratorLevel_RIL_BLOCK'])();
var _emscripten_enum_PageIteratorLevel_RIL_PARA = Module['_emscripten_enum_PageIteratorLevel_RIL_PARA'] = () => (_emscripten_enum_PageIteratorLevel_RIL_PARA = Module['_emscripten_enum_PageIteratorLevel_RIL_PARA'] = wasmExports['emscripten_enum_PageIteratorLevel_RIL_PARA'])();
var _emscripten_enum_PageIteratorLevel_RIL_TEXTLINE = Module['_emscripten_enum_PageIteratorLevel_RIL_TEXTLINE'] = () => (_emscripten_enum_PageIteratorLevel_RIL_TEXTLINE = Module['_emscripten_enum_PageIteratorLevel_RIL_TEXTLINE'] = wasmExports['emscripten_enum_PageIteratorLevel_RIL_TEXTLINE'])();
var _emscripten_enum_PageIteratorLevel_RIL_WORD = Module['_emscripten_enum_PageIteratorLevel_RIL_WORD'] = () => (_emscripten_enum_PageIteratorLevel_RIL_WORD = Module['_emscripten_enum_PageIteratorLevel_RIL_WORD'] = wasmExports['emscripten_enum_PageIteratorLevel_RIL_WORD'])();
var _emscripten_enum_PageIteratorLevel_RIL_SYMBOL = Module['_emscripten_enum_PageIteratorLevel_RIL_SYMBOL'] = () => (_emscripten_enum_PageIteratorLevel_RIL_SYMBOL = Module['_emscripten_enum_PageIteratorLevel_RIL_SYMBOL'] = wasmExports['emscripten_enum_PageIteratorLevel_RIL_SYMBOL'])();
var _emscripten_enum_OcrEngineMode_OEM_TESSERACT_ONLY = Module['_emscripten_enum_OcrEngineMode_OEM_TESSERACT_ONLY'] = () => (_emscripten_enum_OcrEngineMode_OEM_TESSERACT_ONLY = Module['_emscripten_enum_OcrEngineMode_OEM_TESSERACT_ONLY'] = wasmExports['emscripten_enum_OcrEngineMode_OEM_TESSERACT_ONLY'])();
var _emscripten_enum_OcrEngineMode_OEM_LSTM_ONLY = Module['_emscripten_enum_OcrEngineMode_OEM_LSTM_ONLY'] = () => (_emscripten_enum_OcrEngineMode_OEM_LSTM_ONLY = Module['_emscripten_enum_OcrEngineMode_OEM_LSTM_ONLY'] = wasmExports['emscripten_enum_OcrEngineMode_OEM_LSTM_ONLY'])();
var _emscripten_enum_OcrEngineMode_OEM_TESSERACT_LSTM_COMBINED = Module['_emscripten_enum_OcrEngineMode_OEM_TESSERACT_LSTM_COMBINED'] = () => (_emscripten_enum_OcrEngineMode_OEM_TESSERACT_LSTM_COMBINED = Module['_emscripten_enum_OcrEngineMode_OEM_TESSERACT_LSTM_COMBINED'] = wasmExports['emscripten_enum_OcrEngineMode_OEM_TESSERACT_LSTM_COMBINED'])();
var _emscripten_enum_OcrEngineMode_OEM_DEFAULT = Module['_emscripten_enum_OcrEngineMode_OEM_DEFAULT'] = () => (_emscripten_enum_OcrEngineMode_OEM_DEFAULT = Module['_emscripten_enum_OcrEngineMode_OEM_DEFAULT'] = wasmExports['emscripten_enum_OcrEngineMode_OEM_DEFAULT'])();
var _emscripten_enum_OcrEngineMode_OEM_COUNT = Module['_emscripten_enum_OcrEngineMode_OEM_COUNT'] = () => (_emscripten_enum_OcrEngineMode_OEM_COUNT = Module['_emscripten_enum_OcrEngineMode_OEM_COUNT'] = wasmExports['emscripten_enum_OcrEngineMode_OEM_COUNT'])();
var _emscripten_enum_WritingDirection__WRITING_DIRECTION_LEFT_TO_RIGHT = Module['_emscripten_enum_WritingDirection__WRITING_DIRECTION_LEFT_TO_RIGHT'] = () => (_emscripten_enum_WritingDirection__WRITING_DIRECTION_LEFT_TO_RIGHT = Module['_emscripten_enum_WritingDirection__WRITING_DIRECTION_LEFT_TO_RIGHT'] = wasmExports['emscripten_enum_WritingDirection__WRITING_DIRECTION_LEFT_TO_RIGHT'])();
var _emscripten_enum_WritingDirection__WRITING_DIRECTION_RIGHT_TO_LEFT = Module['_emscripten_enum_WritingDirection__WRITING_DIRECTION_RIGHT_TO_LEFT'] = () => (_emscripten_enum_WritingDirection__WRITING_DIRECTION_RIGHT_TO_LEFT = Module['_emscripten_enum_WritingDirection__WRITING_DIRECTION_RIGHT_TO_LEFT'] = wasmExports['emscripten_enum_WritingDirection__WRITING_DIRECTION_RIGHT_TO_LEFT'])();
var _emscripten_enum_WritingDirection__WRITING_DIRECTION_TOP_TO_BOTTOM = Module['_emscripten_enum_WritingDirection__WRITING_DIRECTION_TOP_TO_BOTTOM'] = () => (_emscripten_enum_WritingDirection__WRITING_DIRECTION_TOP_TO_BOTTOM = Module['_emscripten_enum_WritingDirection__WRITING_DIRECTION_TOP_TO_BOTTOM'] = wasmExports['emscripten_enum_WritingDirection__WRITING_DIRECTION_TOP_TO_BOTTOM'])();
var _emscripten_enum_PolyBlockType_PT_UNKNOWN = Module['_emscripten_enum_PolyBlockType_PT_UNKNOWN'] = () => (_emscripten_enum_PolyBlockType_PT_UNKNOWN = Module['_emscripten_enum_PolyBlockType_PT_UNKNOWN'] = wasmExports['emscripten_enum_PolyBlockType_PT_UNKNOWN'])();
var _emscripten_enum_PolyBlockType_PT_FLOWING_TEXT = Module['_emscripten_enum_PolyBlockType_PT_FLOWING_TEXT'] = () => (_emscripten_enum_PolyBlockType_PT_FLOWING_TEXT = Module['_emscripten_enum_PolyBlockType_PT_FLOWING_TEXT'] = wasmExports['emscripten_enum_PolyBlockType_PT_FLOWING_TEXT'])();
var _emscripten_enum_PolyBlockType_PT_HEADING_TEXT = Module['_emscripten_enum_PolyBlockType_PT_HEADING_TEXT'] = () => (_emscripten_enum_PolyBlockType_PT_HEADING_TEXT = Module['_emscripten_enum_PolyBlockType_PT_HEADING_TEXT'] = wasmExports['emscripten_enum_PolyBlockType_PT_HEADING_TEXT'])();
var _emscripten_enum_PolyBlockType_PT_PULLOUT_TEXT = Module['_emscripten_enum_PolyBlockType_PT_PULLOUT_TEXT'] = () => (_emscripten_enum_PolyBlockType_PT_PULLOUT_TEXT = Module['_emscripten_enum_PolyBlockType_PT_PULLOUT_TEXT'] = wasmExports['emscripten_enum_PolyBlockType_PT_PULLOUT_TEXT'])();
var _emscripten_enum_PolyBlockType_PT_EQUATION = Module['_emscripten_enum_PolyBlockType_PT_EQUATION'] = () => (_emscripten_enum_PolyBlockType_PT_EQUATION = Module['_emscripten_enum_PolyBlockType_PT_EQUATION'] = wasmExports['emscripten_enum_PolyBlockType_PT_EQUATION'])();
var _emscripten_enum_PolyBlockType_PT_INLINE_EQUATION = Module['_emscripten_enum_PolyBlockType_PT_INLINE_EQUATION'] = () => (_emscripten_enum_PolyBlockType_PT_INLINE_EQUATION = Module['_emscripten_enum_PolyBlockType_PT_INLINE_EQUATION'] = wasmExports['emscripten_enum_PolyBlockType_PT_INLINE_EQUATION'])();
var _emscripten_enum_PolyBlockType_PT_TABLE = Module['_emscripten_enum_PolyBlockType_PT_TABLE'] = () => (_emscripten_enum_PolyBlockType_PT_TABLE = Module['_emscripten_enum_PolyBlockType_PT_TABLE'] = wasmExports['emscripten_enum_PolyBlockType_PT_TABLE'])();
var _emscripten_enum_PolyBlockType_PT_VERTICAL_TEXT = Module['_emscripten_enum_PolyBlockType_PT_VERTICAL_TEXT'] = () => (_emscripten_enum_PolyBlockType_PT_VERTICAL_TEXT = Module['_emscripten_enum_PolyBlockType_PT_VERTICAL_TEXT'] = wasmExports['emscripten_enum_PolyBlockType_PT_VERTICAL_TEXT'])();
var _emscripten_enum_PolyBlockType_PT_CAPTION_TEXT = Module['_emscripten_enum_PolyBlockType_PT_CAPTION_TEXT'] = () => (_emscripten_enum_PolyBlockType_PT_CAPTION_TEXT = Module['_emscripten_enum_PolyBlockType_PT_CAPTION_TEXT'] = wasmExports['emscripten_enum_PolyBlockType_PT_CAPTION_TEXT'])();
var _emscripten_enum_PolyBlockType_PT_FLOWING_IMAGE = Module['_emscripten_enum_PolyBlockType_PT_FLOWING_IMAGE'] = () => (_emscripten_enum_PolyBlockType_PT_FLOWING_IMAGE = Module['_emscripten_enum_PolyBlockType_PT_FLOWING_IMAGE'] = wasmExports['emscripten_enum_PolyBlockType_PT_FLOWING_IMAGE'])();
var _emscripten_enum_PolyBlockType_PT_HEADING_IMAGE = Module['_emscripten_enum_PolyBlockType_PT_HEADING_IMAGE'] = () => (_emscripten_enum_PolyBlockType_PT_HEADING_IMAGE = Module['_emscripten_enum_PolyBlockType_PT_HEADING_IMAGE'] = wasmExports['emscripten_enum_PolyBlockType_PT_HEADING_IMAGE'])();
var _emscripten_enum_PolyBlockType_PT_PULLOUT_IMAGE = Module['_emscripten_enum_PolyBlockType_PT_PULLOUT_IMAGE'] = () => (_emscripten_enum_PolyBlockType_PT_PULLOUT_IMAGE = Module['_emscripten_enum_PolyBlockType_PT_PULLOUT_IMAGE'] = wasmExports['emscripten_enum_PolyBlockType_PT_PULLOUT_IMAGE'])();
var _emscripten_enum_PolyBlockType_PT_HORZ_LINE = Module['_emscripten_enum_PolyBlockType_PT_HORZ_LINE'] = () => (_emscripten_enum_PolyBlockType_PT_HORZ_LINE = Module['_emscripten_enum_PolyBlockType_PT_HORZ_LINE'] = wasmExports['emscripten_enum_PolyBlockType_PT_HORZ_LINE'])();
var _emscripten_enum_PolyBlockType_PT_VERT_LINE = Module['_emscripten_enum_PolyBlockType_PT_VERT_LINE'] = () => (_emscripten_enum_PolyBlockType_PT_VERT_LINE = Module['_emscripten_enum_PolyBlockType_PT_VERT_LINE'] = wasmExports['emscripten_enum_PolyBlockType_PT_VERT_LINE'])();
var _emscripten_enum_PolyBlockType_PT_NOISE = Module['_emscripten_enum_PolyBlockType_PT_NOISE'] = () => (_emscripten_enum_PolyBlockType_PT_NOISE = Module['_emscripten_enum_PolyBlockType_PT_NOISE'] = wasmExports['emscripten_enum_PolyBlockType_PT_NOISE'])();
var _emscripten_enum_PolyBlockType_PT_COUNT = Module['_emscripten_enum_PolyBlockType_PT_COUNT'] = () => (_emscripten_enum_PolyBlockType_PT_COUNT = Module['_emscripten_enum_PolyBlockType_PT_COUNT'] = wasmExports['emscripten_enum_PolyBlockType_PT_COUNT'])();
var _emscripten_enum_StrongScriptDirection_DIR_NEUTRAL = Module['_emscripten_enum_StrongScriptDirection_DIR_NEUTRAL'] = () => (_emscripten_enum_StrongScriptDirection_DIR_NEUTRAL = Module['_emscripten_enum_StrongScriptDirection_DIR_NEUTRAL'] = wasmExports['emscripten_enum_StrongScriptDirection_DIR_NEUTRAL'])();
var _emscripten_enum_StrongScriptDirection_DIR_LEFT_TO_RIGHT = Module['_emscripten_enum_StrongScriptDirection_DIR_LEFT_TO_RIGHT'] = () => (_emscripten_enum_StrongScriptDirection_DIR_LEFT_TO_RIGHT = Module['_emscripten_enum_StrongScriptDirection_DIR_LEFT_TO_RIGHT'] = wasmExports['emscripten_enum_StrongScriptDirection_DIR_LEFT_TO_RIGHT'])();
var _emscripten_enum_StrongScriptDirection_DIR_RIGHT_TO_LEFT = Module['_emscripten_enum_StrongScriptDirection_DIR_RIGHT_TO_LEFT'] = () => (_emscripten_enum_StrongScriptDirection_DIR_RIGHT_TO_LEFT = Module['_emscripten_enum_StrongScriptDirection_DIR_RIGHT_TO_LEFT'] = wasmExports['emscripten_enum_StrongScriptDirection_DIR_RIGHT_TO_LEFT'])();
var _emscripten_enum_StrongScriptDirection_DIR_MIX = Module['_emscripten_enum_StrongScriptDirection_DIR_MIX'] = () => (_emscripten_enum_StrongScriptDirection_DIR_MIX = Module['_emscripten_enum_StrongScriptDirection_DIR_MIX'] = wasmExports['emscripten_enum_StrongScriptDirection_DIR_MIX'])();
var _emscripten_enum_ParagraphJustification__JUSTIFICATION_UNKNOWN = Module['_emscripten_enum_ParagraphJustification__JUSTIFICATION_UNKNOWN'] = () => (_emscripten_enum_ParagraphJustification__JUSTIFICATION_UNKNOWN = Module['_emscripten_enum_ParagraphJustification__JUSTIFICATION_UNKNOWN'] = wasmExports['emscripten_enum_ParagraphJustification__JUSTIFICATION_UNKNOWN'])();
var _emscripten_enum_ParagraphJustification__JUSTIFICATION_LEFT = Module['_emscripten_enum_ParagraphJustification__JUSTIFICATION_LEFT'] = () => (_emscripten_enum_ParagraphJustification__JUSTIFICATION_LEFT = Module['_emscripten_enum_ParagraphJustification__JUSTIFICATION_LEFT'] = wasmExports['emscripten_enum_ParagraphJustification__JUSTIFICATION_LEFT'])();
var _emscripten_enum_ParagraphJustification__JUSTIFICATION_CENTER = Module['_emscripten_enum_ParagraphJustification__JUSTIFICATION_CENTER'] = () => (_emscripten_enum_ParagraphJustification__JUSTIFICATION_CENTER = Module['_emscripten_enum_ParagraphJustification__JUSTIFICATION_CENTER'] = wasmExports['emscripten_enum_ParagraphJustification__JUSTIFICATION_CENTER'])();
var _emscripten_enum_ParagraphJustification__JUSTIFICATION_RIGHT = Module['_emscripten_enum_ParagraphJustification__JUSTIFICATION_RIGHT'] = () => (_emscripten_enum_ParagraphJustification__JUSTIFICATION_RIGHT = Module['_emscripten_enum_ParagraphJustification__JUSTIFICATION_RIGHT'] = wasmExports['emscripten_enum_ParagraphJustification__JUSTIFICATION_RIGHT'])();
var _emscripten_enum_TextlineOrder__TEXTLINE_ORDER_LEFT_TO_RIGHT = Module['_emscripten_enum_TextlineOrder__TEXTLINE_ORDER_LEFT_TO_RIGHT'] = () => (_emscripten_enum_TextlineOrder__TEXTLINE_ORDER_LEFT_TO_RIGHT = Module['_emscripten_enum_TextlineOrder__TEXTLINE_ORDER_LEFT_TO_RIGHT'] = wasmExports['emscripten_enum_TextlineOrder__TEXTLINE_ORDER_LEFT_TO_RIGHT'])();
var _emscripten_enum_TextlineOrder__TEXTLINE_ORDER_RIGHT_TO_LEFT = Module['_emscripten_enum_TextlineOrder__TEXTLINE_ORDER_RIGHT_TO_LEFT'] = () => (_emscripten_enum_TextlineOrder__TEXTLINE_ORDER_RIGHT_TO_LEFT = Module['_emscripten_enum_TextlineOrder__TEXTLINE_ORDER_RIGHT_TO_LEFT'] = wasmExports['emscripten_enum_TextlineOrder__TEXTLINE_ORDER_RIGHT_TO_LEFT'])();
var _emscripten_enum_TextlineOrder__TEXTLINE_ORDER_TOP_TO_BOTTOM = Module['_emscripten_enum_TextlineOrder__TEXTLINE_ORDER_TOP_TO_BOTTOM'] = () => (_emscripten_enum_TextlineOrder__TEXTLINE_ORDER_TOP_TO_BOTTOM = Module['_emscripten_enum_TextlineOrder__TEXTLINE_ORDER_TOP_TO_BOTTOM'] = wasmExports['emscripten_enum_TextlineOrder__TEXTLINE_ORDER_TOP_TO_BOTTOM'])();
var _emscripten_enum_Orientation__ORIENTATION_PAGE_UP = Module['_emscripten_enum_Orientation__ORIENTATION_PAGE_UP'] = () => (_emscripten_enum_Orientation__ORIENTATION_PAGE_UP = Module['_emscripten_enum_Orientation__ORIENTATION_PAGE_UP'] = wasmExports['emscripten_enum_Orientation__ORIENTATION_PAGE_UP'])();
var _emscripten_enum_Orientation__ORIENTATION_PAGE_RIGHT = Module['_emscripten_enum_Orientation__ORIENTATION_PAGE_RIGHT'] = () => (_emscripten_enum_Orientation__ORIENTATION_PAGE_RIGHT = Module['_emscripten_enum_Orientation__ORIENTATION_PAGE_RIGHT'] = wasmExports['emscripten_enum_Orientation__ORIENTATION_PAGE_RIGHT'])();
var _emscripten_enum_Orientation__ORIENTATION_PAGE_DOWN = Module['_emscripten_enum_Orientation__ORIENTATION_PAGE_DOWN'] = () => (_emscripten_enum_Orientation__ORIENTATION_PAGE_DOWN = Module['_emscripten_enum_Orientation__ORIENTATION_PAGE_DOWN'] = wasmExports['emscripten_enum_Orientation__ORIENTATION_PAGE_DOWN'])();
var _emscripten_enum_Orientation__ORIENTATION_PAGE_LEFT = Module['_emscripten_enum_Orientation__ORIENTATION_PAGE_LEFT'] = () => (_emscripten_enum_Orientation__ORIENTATION_PAGE_LEFT = Module['_emscripten_enum_Orientation__ORIENTATION_PAGE_LEFT'] = wasmExports['emscripten_enum_Orientation__ORIENTATION_PAGE_LEFT'])();
var _emscripten_enum_PageSegMode_PSM_OSD_ONLY = Module['_emscripten_enum_PageSegMode_PSM_OSD_ONLY'] = () => (_emscripten_enum_PageSegMode_PSM_OSD_ONLY = Module['_emscripten_enum_PageSegMode_PSM_OSD_ONLY'] = wasmExports['emscripten_enum_PageSegMode_PSM_OSD_ONLY'])();
var _emscripten_enum_PageSegMode_PSM_AUTO_OSD = Module['_emscripten_enum_PageSegMode_PSM_AUTO_OSD'] = () => (_emscripten_enum_PageSegMode_PSM_AUTO_OSD = Module['_emscripten_enum_PageSegMode_PSM_AUTO_OSD'] = wasmExports['emscripten_enum_PageSegMode_PSM_AUTO_OSD'])();
var _emscripten_enum_PageSegMode_PSM_AUTO_ONLY = Module['_emscripten_enum_PageSegMode_PSM_AUTO_ONLY'] = () => (_emscripten_enum_PageSegMode_PSM_AUTO_ONLY = Module['_emscripten_enum_PageSegMode_PSM_AUTO_ONLY'] = wasmExports['emscripten_enum_PageSegMode_PSM_AUTO_ONLY'])();
var _emscripten_enum_PageSegMode_PSM_AUTO = Module['_emscripten_enum_PageSegMode_PSM_AUTO'] = () => (_emscripten_enum_PageSegMode_PSM_AUTO = Module['_emscripten_enum_PageSegMode_PSM_AUTO'] = wasmExports['emscripten_enum_PageSegMode_PSM_AUTO'])();
var _emscripten_enum_PageSegMode_PSM_SINGLE_COLUMN = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_COLUMN'] = () => (_emscripten_enum_PageSegMode_PSM_SINGLE_COLUMN = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_COLUMN'] = wasmExports['emscripten_enum_PageSegMode_PSM_SINGLE_COLUMN'])();
var _emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK_VERT_TEXT = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK_VERT_TEXT'] = () => (_emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK_VERT_TEXT = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK_VERT_TEXT'] = wasmExports['emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK_VERT_TEXT'])();
var _emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK'] = () => (_emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK'] = wasmExports['emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK'])();
var _emscripten_enum_PageSegMode_PSM_SINGLE_LINE = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_LINE'] = () => (_emscripten_enum_PageSegMode_PSM_SINGLE_LINE = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_LINE'] = wasmExports['emscripten_enum_PageSegMode_PSM_SINGLE_LINE'])();
var _emscripten_enum_PageSegMode_PSM_SINGLE_WORD = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_WORD'] = () => (_emscripten_enum_PageSegMode_PSM_SINGLE_WORD = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_WORD'] = wasmExports['emscripten_enum_PageSegMode_PSM_SINGLE_WORD'])();
var _emscripten_enum_PageSegMode_PSM_CIRCLE_WORD = Module['_emscripten_enum_PageSegMode_PSM_CIRCLE_WORD'] = () => (_emscripten_enum_PageSegMode_PSM_CIRCLE_WORD = Module['_emscripten_enum_PageSegMode_PSM_CIRCLE_WORD'] = wasmExports['emscripten_enum_PageSegMode_PSM_CIRCLE_WORD'])();
var _emscripten_enum_PageSegMode_PSM_SINGLE_CHAR = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_CHAR'] = () => (_emscripten_enum_PageSegMode_PSM_SINGLE_CHAR = Module['_emscripten_enum_PageSegMode_PSM_SINGLE_CHAR'] = wasmExports['emscripten_enum_PageSegMode_PSM_SINGLE_CHAR'])();
var _emscripten_enum_PageSegMode_PSM_SPARSE_TEXT = Module['_emscripten_enum_PageSegMode_PSM_SPARSE_TEXT'] = () => (_emscripten_enum_PageSegMode_PSM_SPARSE_TEXT = Module['_emscripten_enum_PageSegMode_PSM_SPARSE_TEXT'] = wasmExports['emscripten_enum_PageSegMode_PSM_SPARSE_TEXT'])();
var _emscripten_enum_PageSegMode_PSM_SPARSE_TEXT_OSD = Module['_emscripten_enum_PageSegMode_PSM_SPARSE_TEXT_OSD'] = () => (_emscripten_enum_PageSegMode_PSM_SPARSE_TEXT_OSD = Module['_emscripten_enum_PageSegMode_PSM_SPARSE_TEXT_OSD'] = wasmExports['emscripten_enum_PageSegMode_PSM_SPARSE_TEXT_OSD'])();
var _emscripten_enum_PageSegMode_PSM_RAW_LINE = Module['_emscripten_enum_PageSegMode_PSM_RAW_LINE'] = () => (_emscripten_enum_PageSegMode_PSM_RAW_LINE = Module['_emscripten_enum_PageSegMode_PSM_RAW_LINE'] = wasmExports['emscripten_enum_PageSegMode_PSM_RAW_LINE'])();
var _emscripten_enum_PageSegMode_PSM_COUNT = Module['_emscripten_enum_PageSegMode_PSM_COUNT'] = () => (_emscripten_enum_PageSegMode_PSM_COUNT = Module['_emscripten_enum_PageSegMode_PSM_COUNT'] = wasmExports['emscripten_enum_PageSegMode_PSM_COUNT'])();
var _ptaDestroy = Module['_ptaDestroy'] = (a0) => (_ptaDestroy = Module['_ptaDestroy'] = wasmExports['ptaDestroy'])(a0);
var _boxaDestroy = Module['_boxaDestroy'] = (a0) => (_boxaDestroy = Module['_boxaDestroy'] = wasmExports['boxaDestroy'])(a0);
var _pixaDestroy = Module['_pixaDestroy'] = (a0) => (_pixaDestroy = Module['_pixaDestroy'] = wasmExports['pixaDestroy'])(a0);
var ___errno_location = () => (___errno_location = wasmExports['__errno_location'])();
var _malloc = Module['_malloc'] = (a0) => (_malloc = Module['_malloc'] = wasmExports['malloc'])(a0);
var _pixReadHeaderMem = Module['_pixReadHeaderMem'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_pixReadHeaderMem = Module['_pixReadHeaderMem'] = wasmExports['pixReadHeaderMem'])(a0, a1, a2, a3, a4, a5, a6, a7);
var __initialize = Module['__initialize'] = () => (__initialize = Module['__initialize'] = wasmExports['_initialize'])();
var _setThrew = (a0, a1) => (_setThrew = wasmExports['setThrew'])(a0, a1);
var stackSave = () => (stackSave = wasmExports['stackSave'])();
var stackRestore = (a0) => (stackRestore = wasmExports['stackRestore'])(a0);
var stackAlloc = (a0) => (stackAlloc = wasmExports['stackAlloc'])(a0);
var ___cxa_demangle = (a0, a1, a2, a3) => (___cxa_demangle = wasmExports['__cxa_demangle'])(a0, a1, a2, a3);
var ___emscripten_embedded_file_data = Module['___emscripten_embedded_file_data'] = 397552;
function invoke_iiii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vi(index,a1) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_ii(index,a1) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viid(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

// include: base64Utils.js
// Converts a string of base64 into a byte array (Uint8Array).
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE != 'undefined' && ENVIRONMENT_IS_NODE) {
    var buf = Buffer.from(s, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  }

  var decoded = atob(s);
  var bytes = new Uint8Array(decoded.length);
  for (var i = 0 ; i < decoded.length ; ++i) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}
// end include: base64Utils.js
Module['addRunDependency'] = addRunDependency;
Module['removeRunDependency'] = removeRunDependency;
Module['FS_createPath'] = FS.createPath;
Module['FS_createLazyFile'] = FS.createLazyFile;
Module['FS_createDevice'] = FS.createDevice;
Module['setValue'] = setValue;
Module['getValue'] = getValue;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
Module['FS'] = FS;
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_unlink'] = FS.unlink;


var calledRun;

var mainArgs = undefined;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain(args = []) {

  var entryFunction = __initialize;

  mainArgs = [thisProgram].concat(args)

  try {

    entryFunction();
    // _start (in crt1.c) will call exit() if main return non-zero.  So we know
    // that if we get here main returned zero.
    var ret = 0;

    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  }
  catch (e) {
    return handleException(e);
  }
}

function run(args = arguments_) {

  if (runDependencies > 0) {
    return;
  }

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (shouldRunNow) callMain(args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = false;

if (Module['noInitialRun']) shouldRunNow = false;

run();


// end include: postamble.js
// include: /src/javascript/glue.js

// Bindings utilities

function WrapperObject() {
}
WrapperObject.prototype = Object.create(WrapperObject.prototype);
WrapperObject.prototype.constructor = WrapperObject;
WrapperObject.prototype.__class__ = WrapperObject;
WrapperObject.__cache__ = {};
Module['WrapperObject'] = WrapperObject;

function getCache(__class__) {
  return (__class__ || WrapperObject).__cache__;
}
Module['getCache'] = getCache;

function wrapPointer(ptr, __class__) {
  var cache = getCache(__class__);
  var ret = cache[ptr];
  if (ret) return ret;
  ret = Object.create((__class__ || WrapperObject).prototype);
  ret.ptr = ptr;
  return cache[ptr] = ret;
}
Module['wrapPointer'] = wrapPointer;

function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;

Module['NULL'] = wrapPointer(0);

function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  // Remove from cache, so the object can be GC'd and refs added onto it released
  delete getCache(obj.__class__)[obj.ptr];
}
Module['destroy'] = destroy;

function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;

function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;

function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;

// Converts big (string or array) values into a C-style storage, in temporary space

var ensureCache = {
  buffer: 0,  // the main buffer of temporary storage
  size: 0,   // the size of buffer
  pos: 0,    // the next free offset in buffer
  temps: [], // extra allocations
  needed: 0, // the total size we need next time

  prepare: function() {
    if (ensureCache.needed) {
      // clear the temps
      for (var i = 0; i < ensureCache.temps.length; i++) {
        Module['_free'](ensureCache.temps[i]);
      }
      ensureCache.temps.length = 0;
      // prepare to allocate a bigger buffer
      Module['_free'](ensureCache.buffer);
      ensureCache.buffer = 0;
      ensureCache.size += ensureCache.needed;
      // clean up
      ensureCache.needed = 0;
    }
    if (!ensureCache.buffer) { // happens first time, or when we need to grow
      ensureCache.size += 128; // heuristic, avoid many small grow events
      ensureCache.buffer = Module['_malloc'](ensureCache.size);
      assert(ensureCache.buffer);
    }
    ensureCache.pos = 0;
  },
  alloc: function(array, view) {
    assert(ensureCache.buffer);
    var bytes = view.BYTES_PER_ELEMENT;
    var len = array.length * bytes;
    len = (len + 7) & -8; // keep things aligned to 8 byte boundaries
    var ret;
    if (ensureCache.pos + len >= ensureCache.size) {
      // we failed to allocate in the buffer, ensureCache time around :(
      assert(len > 0); // null terminator, at least
      ensureCache.needed += len;
      ret = Module['_malloc'](len);
      ensureCache.temps.push(ret);
    } else {
      // we can allocate in the buffer
      ret = ensureCache.buffer + ensureCache.pos;
      ensureCache.pos += len;
    }
    return ret;
  },
  copy: function(array, view, offset) {
    var offsetShifted = offset;
    var bytes = view.BYTES_PER_ELEMENT;
    switch (bytes) {
      case 2: offsetShifted >>= 1; break;
      case 4: offsetShifted >>= 2; break;
      case 8: offsetShifted >>= 3; break;
    }
    for (var i = 0; i < array.length; i++) {
      view[offsetShifted + i] = array[i];
    }
  },
};

function ensureString(value) {
  if (typeof value === 'string') {
    var intArray = intArrayFromString(value);
    var offset = ensureCache.alloc(intArray, HEAP8);
    ensureCache.copy(intArray, HEAP8, offset);
    return offset;
  }
  return value;
}
function ensureInt8(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP8);
    ensureCache.copy(value, HEAP8, offset);
    return offset;
  }
  return value;
}
function ensureInt16(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP16);
    ensureCache.copy(value, HEAP16, offset);
    return offset;
  }
  return value;
}
function ensureInt32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP32);
    ensureCache.copy(value, HEAP32, offset);
    return offset;
  }
  return value;
}
function ensureFloat32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF32);
    ensureCache.copy(value, HEAPF32, offset);
    return offset;
  }
  return value;
}
function ensureFloat64(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF64);
    ensureCache.copy(value, HEAPF64, offset);
    return offset;
  }
  return value;
}


// ParagraphJustification
/** @suppress {undefinedVars, duplicate} */function ParagraphJustification() { throw "cannot construct a ParagraphJustification, no constructor in IDL" }
ParagraphJustification.prototype = Object.create(WrapperObject.prototype);
ParagraphJustification.prototype.constructor = ParagraphJustification;
ParagraphJustification.prototype.__class__ = ParagraphJustification;
ParagraphJustification.__cache__ = {};
Module['ParagraphJustification'] = ParagraphJustification;

  ParagraphJustification.prototype['__destroy__'] = ParagraphJustification.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_ParagraphJustification___destroy___0(self);
};
// BoolPtr
/** @suppress {undefinedVars, duplicate} */function BoolPtr() { throw "cannot construct a BoolPtr, no constructor in IDL" }
BoolPtr.prototype = Object.create(WrapperObject.prototype);
BoolPtr.prototype.constructor = BoolPtr;
BoolPtr.prototype.__class__ = BoolPtr;
BoolPtr.__cache__ = {};
Module['BoolPtr'] = BoolPtr;

  BoolPtr.prototype['__destroy__'] = BoolPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_BoolPtr___destroy___0(self);
};
// TessResultRenderer
/** @suppress {undefinedVars, duplicate} */function TessResultRenderer() { throw "cannot construct a TessResultRenderer, no constructor in IDL" }
TessResultRenderer.prototype = Object.create(WrapperObject.prototype);
TessResultRenderer.prototype.constructor = TessResultRenderer;
TessResultRenderer.prototype.__class__ = TessResultRenderer;
TessResultRenderer.__cache__ = {};
Module['TessResultRenderer'] = TessResultRenderer;

TessResultRenderer.prototype['BeginDocument'] = TessResultRenderer.prototype.BeginDocument = /** @suppress {undefinedVars, duplicate} */function(title) {
  var self = this.ptr;
  ensureCache.prepare();
  if (title && typeof title === 'object') title = title.ptr;
  else title = ensureString(title);
  return !!(_emscripten_bind_TessResultRenderer_BeginDocument_1(self, title));
};;

TessResultRenderer.prototype['AddImage'] = TessResultRenderer.prototype.AddImage = /** @suppress {undefinedVars, duplicate} */function(api) {
  var self = this.ptr;
  if (api && typeof api === 'object') api = api.ptr;
  return !!(_emscripten_bind_TessResultRenderer_AddImage_1(self, api));
};;

TessResultRenderer.prototype['EndDocument'] = TessResultRenderer.prototype.EndDocument = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_TessResultRenderer_EndDocument_0(self));
};;

TessResultRenderer.prototype['happy'] = TessResultRenderer.prototype.happy = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_TessResultRenderer_happy_0(self));
};;

TessResultRenderer.prototype['file_extension'] = TessResultRenderer.prototype.file_extension = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessResultRenderer_file_extension_0(self));
};;

TessResultRenderer.prototype['title'] = TessResultRenderer.prototype.title = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessResultRenderer_title_0(self));
};;

TessResultRenderer.prototype['imagenum'] = TessResultRenderer.prototype.imagenum = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessResultRenderer_imagenum_0(self);
};;

  TessResultRenderer.prototype['__destroy__'] = TessResultRenderer.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessResultRenderer___destroy___0(self);
};
// LongStarPtr
/** @suppress {undefinedVars, duplicate} */function LongStarPtr() { throw "cannot construct a LongStarPtr, no constructor in IDL" }
LongStarPtr.prototype = Object.create(WrapperObject.prototype);
LongStarPtr.prototype.constructor = LongStarPtr;
LongStarPtr.prototype.__class__ = LongStarPtr;
LongStarPtr.__cache__ = {};
Module['LongStarPtr'] = LongStarPtr;

  LongStarPtr.prototype['__destroy__'] = LongStarPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_LongStarPtr___destroy___0(self);
};
// VoidPtr
/** @suppress {undefinedVars, duplicate} */function VoidPtr() { throw "cannot construct a VoidPtr, no constructor in IDL" }
VoidPtr.prototype = Object.create(WrapperObject.prototype);
VoidPtr.prototype.constructor = VoidPtr;
VoidPtr.prototype.__class__ = VoidPtr;
VoidPtr.__cache__ = {};
Module['VoidPtr'] = VoidPtr;

  VoidPtr.prototype['__destroy__'] = VoidPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_VoidPtr___destroy___0(self);
};
// ResultIterator
/** @suppress {undefinedVars, duplicate} */function ResultIterator(resit) {
  if (resit && typeof resit === 'object') resit = resit.ptr;
  this.ptr = _emscripten_bind_ResultIterator_ResultIterator_1(resit);
  getCache(ResultIterator)[this.ptr] = this;
};;
ResultIterator.prototype = Object.create(WrapperObject.prototype);
ResultIterator.prototype.constructor = ResultIterator;
ResultIterator.prototype.__class__ = ResultIterator;
ResultIterator.__cache__ = {};
Module['ResultIterator'] = ResultIterator;

ResultIterator.prototype['Begin'] = ResultIterator.prototype.Begin = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_ResultIterator_Begin_0(self);
};;

ResultIterator.prototype['RestartParagraph'] = ResultIterator.prototype.RestartParagraph = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_ResultIterator_RestartParagraph_0(self);
};;

ResultIterator.prototype['IsWithinFirstTextlineOfParagraph'] = ResultIterator.prototype.IsWithinFirstTextlineOfParagraph = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ResultIterator_IsWithinFirstTextlineOfParagraph_0(self));
};;

ResultIterator.prototype['RestartRow'] = ResultIterator.prototype.RestartRow = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_ResultIterator_RestartRow_0(self);
};;

ResultIterator.prototype['Next'] = ResultIterator.prototype.Next = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return !!(_emscripten_bind_ResultIterator_Next_1(self, level));
};;

ResultIterator.prototype['IsAtBeginningOf'] = ResultIterator.prototype.IsAtBeginningOf = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return !!(_emscripten_bind_ResultIterator_IsAtBeginningOf_1(self, level));
};;

ResultIterator.prototype['IsAtFinalElement'] = ResultIterator.prototype.IsAtFinalElement = /** @suppress {undefinedVars, duplicate} */function(level, element) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (element && typeof element === 'object') element = element.ptr;
  return !!(_emscripten_bind_ResultIterator_IsAtFinalElement_2(self, level, element));
};;

ResultIterator.prototype['Cmp'] = ResultIterator.prototype.Cmp = /** @suppress {undefinedVars, duplicate} */function(other) {
  var self = this.ptr;
  if (other && typeof other === 'object') other = other.ptr;
  return _emscripten_bind_ResultIterator_Cmp_1(self, other);
};;

ResultIterator.prototype['SetBoundingBoxComponents'] = ResultIterator.prototype.SetBoundingBoxComponents = /** @suppress {undefinedVars, duplicate} */function(include_upper_dots, include_lower_dots) {
  var self = this.ptr;
  if (include_upper_dots && typeof include_upper_dots === 'object') include_upper_dots = include_upper_dots.ptr;
  if (include_lower_dots && typeof include_lower_dots === 'object') include_lower_dots = include_lower_dots.ptr;
  _emscripten_bind_ResultIterator_SetBoundingBoxComponents_2(self, include_upper_dots, include_lower_dots);
};;

ResultIterator.prototype['BoundingBox'] = ResultIterator.prototype.BoundingBox = /** @suppress {undefinedVars, duplicate} */function(level, padding, left, top, right, bottom) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (padding && typeof padding === 'object') padding = padding.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  if (right && typeof right === 'object') right = right.ptr;
  if (bottom && typeof bottom === 'object') bottom = bottom.ptr;
  if (bottom === undefined) { return !!(_emscripten_bind_ResultIterator_BoundingBox_5(self, level, padding, left, top, right)) }
  return !!(_emscripten_bind_ResultIterator_BoundingBox_6(self, level, padding, left, top, right, bottom));
};;

ResultIterator.prototype['BoundingBoxInternal'] = ResultIterator.prototype.BoundingBoxInternal = /** @suppress {undefinedVars, duplicate} */function(level, left, top, right, bottom) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  if (right && typeof right === 'object') right = right.ptr;
  if (bottom && typeof bottom === 'object') bottom = bottom.ptr;
  return !!(_emscripten_bind_ResultIterator_BoundingBoxInternal_5(self, level, left, top, right, bottom));
};;

ResultIterator.prototype['Empty'] = ResultIterator.prototype.Empty = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return !!(_emscripten_bind_ResultIterator_Empty_1(self, level));
};;

ResultIterator.prototype['BlockType'] = ResultIterator.prototype.BlockType = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_ResultIterator_BlockType_0(self);
};;

ResultIterator.prototype['BlockPolygon'] = ResultIterator.prototype.BlockPolygon = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_ResultIterator_BlockPolygon_0(self), Pta);
};;

ResultIterator.prototype['GetBinaryImage'] = ResultIterator.prototype.GetBinaryImage = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return wrapPointer(_emscripten_bind_ResultIterator_GetBinaryImage_1(self, level), Pix);
};;

ResultIterator.prototype['GetImage'] = ResultIterator.prototype.GetImage = /** @suppress {undefinedVars, duplicate} */function(level, padding, original_img, left, top) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (padding && typeof padding === 'object') padding = padding.ptr;
  if (original_img && typeof original_img === 'object') original_img = original_img.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  return wrapPointer(_emscripten_bind_ResultIterator_GetImage_5(self, level, padding, original_img, left, top), Pix);
};;

ResultIterator.prototype['Baseline'] = ResultIterator.prototype.Baseline = /** @suppress {undefinedVars, duplicate} */function(level, x1, y1, x2, y2) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (x1 && typeof x1 === 'object') x1 = x1.ptr;
  if (y1 && typeof y1 === 'object') y1 = y1.ptr;
  if (x2 && typeof x2 === 'object') x2 = x2.ptr;
  if (y2 && typeof y2 === 'object') y2 = y2.ptr;
  return !!(_emscripten_bind_ResultIterator_Baseline_5(self, level, x1, y1, x2, y2));
};;

ResultIterator.prototype['Orientation'] = ResultIterator.prototype.Orientation = /** @suppress {undefinedVars, duplicate} */function(orientation, writing_direction, textline_order, deskew_angle) {
  var self = this.ptr;
  if (orientation && typeof orientation === 'object') orientation = orientation.ptr;
  if (writing_direction && typeof writing_direction === 'object') writing_direction = writing_direction.ptr;
  if (textline_order && typeof textline_order === 'object') textline_order = textline_order.ptr;
  if (deskew_angle && typeof deskew_angle === 'object') deskew_angle = deskew_angle.ptr;
  _emscripten_bind_ResultIterator_Orientation_4(self, orientation, writing_direction, textline_order, deskew_angle);
};;

ResultIterator.prototype['ParagraphInfo'] = ResultIterator.prototype.ParagraphInfo = /** @suppress {undefinedVars, duplicate} */function(justification, is_list_item, is_crown, first_line_indent) {
  var self = this.ptr;
  if (justification && typeof justification === 'object') justification = justification.ptr;
  if (is_list_item && typeof is_list_item === 'object') is_list_item = is_list_item.ptr;
  if (is_crown && typeof is_crown === 'object') is_crown = is_crown.ptr;
  if (first_line_indent && typeof first_line_indent === 'object') first_line_indent = first_line_indent.ptr;
  _emscripten_bind_ResultIterator_ParagraphInfo_4(self, justification, is_list_item, is_crown, first_line_indent);
};;

ResultIterator.prototype['ParagraphIsLtr'] = ResultIterator.prototype.ParagraphIsLtr = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ResultIterator_ParagraphIsLtr_0(self));
};;

ResultIterator.prototype['GetUTF8Text'] = ResultIterator.prototype.GetUTF8Text = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return UTF8ToString(_emscripten_bind_ResultIterator_GetUTF8Text_1(self, level));
};;

ResultIterator.prototype['SetLineSeparator'] = ResultIterator.prototype.SetLineSeparator = /** @suppress {undefinedVars, duplicate} */function(new_line) {
  var self = this.ptr;
  ensureCache.prepare();
  if (new_line && typeof new_line === 'object') new_line = new_line.ptr;
  else new_line = ensureString(new_line);
  _emscripten_bind_ResultIterator_SetLineSeparator_1(self, new_line);
};;

ResultIterator.prototype['SetParagraphSeparator'] = ResultIterator.prototype.SetParagraphSeparator = /** @suppress {undefinedVars, duplicate} */function(new_para) {
  var self = this.ptr;
  ensureCache.prepare();
  if (new_para && typeof new_para === 'object') new_para = new_para.ptr;
  else new_para = ensureString(new_para);
  _emscripten_bind_ResultIterator_SetParagraphSeparator_1(self, new_para);
};;

ResultIterator.prototype['Confidence'] = ResultIterator.prototype.Confidence = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return _emscripten_bind_ResultIterator_Confidence_1(self, level);
};;

ResultIterator.prototype['WordFontAttributes'] = ResultIterator.prototype.WordFontAttributes = /** @suppress {undefinedVars, duplicate} */function(is_bold, is_italic, is_underlined, is_monospace, is_serif, is_smallcaps, pointsize, font_id) {
  var self = this.ptr;
  if (is_bold && typeof is_bold === 'object') is_bold = is_bold.ptr;
  if (is_italic && typeof is_italic === 'object') is_italic = is_italic.ptr;
  if (is_underlined && typeof is_underlined === 'object') is_underlined = is_underlined.ptr;
  if (is_monospace && typeof is_monospace === 'object') is_monospace = is_monospace.ptr;
  if (is_serif && typeof is_serif === 'object') is_serif = is_serif.ptr;
  if (is_smallcaps && typeof is_smallcaps === 'object') is_smallcaps = is_smallcaps.ptr;
  if (pointsize && typeof pointsize === 'object') pointsize = pointsize.ptr;
  if (font_id && typeof font_id === 'object') font_id = font_id.ptr;
  return UTF8ToString(_emscripten_bind_ResultIterator_WordFontAttributes_8(self, is_bold, is_italic, is_underlined, is_monospace, is_serif, is_smallcaps, pointsize, font_id));
};;

ResultIterator.prototype['WordRecognitionLanguage'] = ResultIterator.prototype.WordRecognitionLanguage = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ResultIterator_WordRecognitionLanguage_0(self));
};;

ResultIterator.prototype['WordDirection'] = ResultIterator.prototype.WordDirection = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_ResultIterator_WordDirection_0(self);
};;

ResultIterator.prototype['WordIsFromDictionary'] = ResultIterator.prototype.WordIsFromDictionary = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ResultIterator_WordIsFromDictionary_0(self));
};;

ResultIterator.prototype['WordIsNumeric'] = ResultIterator.prototype.WordIsNumeric = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ResultIterator_WordIsNumeric_0(self));
};;

ResultIterator.prototype['HasBlamerInfo'] = ResultIterator.prototype.HasBlamerInfo = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ResultIterator_HasBlamerInfo_0(self));
};;

ResultIterator.prototype['HasTruthString'] = ResultIterator.prototype.HasTruthString = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ResultIterator_HasTruthString_0(self));
};;

ResultIterator.prototype['EquivalentToTruth'] = ResultIterator.prototype.EquivalentToTruth = /** @suppress {undefinedVars, duplicate} */function(str) {
  var self = this.ptr;
  ensureCache.prepare();
  if (str && typeof str === 'object') str = str.ptr;
  else str = ensureString(str);
  return !!(_emscripten_bind_ResultIterator_EquivalentToTruth_1(self, str));
};;

ResultIterator.prototype['WordTruthUTF8Text'] = ResultIterator.prototype.WordTruthUTF8Text = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ResultIterator_WordTruthUTF8Text_0(self));
};;

ResultIterator.prototype['WordNormedUTF8Text'] = ResultIterator.prototype.WordNormedUTF8Text = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ResultIterator_WordNormedUTF8Text_0(self));
};;

ResultIterator.prototype['WordLattice'] = ResultIterator.prototype.WordLattice = /** @suppress {undefinedVars, duplicate} */function(lattice_size) {
  var self = this.ptr;
  if (lattice_size && typeof lattice_size === 'object') lattice_size = lattice_size.ptr;
  return UTF8ToString(_emscripten_bind_ResultIterator_WordLattice_1(self, lattice_size));
};;

ResultIterator.prototype['SymbolIsSuperscript'] = ResultIterator.prototype.SymbolIsSuperscript = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ResultIterator_SymbolIsSuperscript_0(self));
};;

ResultIterator.prototype['SymbolIsSubscript'] = ResultIterator.prototype.SymbolIsSubscript = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ResultIterator_SymbolIsSubscript_0(self));
};;

ResultIterator.prototype['SymbolIsDropcap'] = ResultIterator.prototype.SymbolIsDropcap = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ResultIterator_SymbolIsDropcap_0(self));
};;

  ResultIterator.prototype['__destroy__'] = ResultIterator.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_ResultIterator___destroy___0(self);
};
// TextlineOrder
/** @suppress {undefinedVars, duplicate} */function TextlineOrder() { throw "cannot construct a TextlineOrder, no constructor in IDL" }
TextlineOrder.prototype = Object.create(WrapperObject.prototype);
TextlineOrder.prototype.constructor = TextlineOrder;
TextlineOrder.prototype.__class__ = TextlineOrder;
TextlineOrder.__cache__ = {};
Module['TextlineOrder'] = TextlineOrder;

  TextlineOrder.prototype['__destroy__'] = TextlineOrder.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TextlineOrder___destroy___0(self);
};
// ETEXT_DESC
/** @suppress {undefinedVars, duplicate} */function ETEXT_DESC() { throw "cannot construct a ETEXT_DESC, no constructor in IDL" }
ETEXT_DESC.prototype = Object.create(WrapperObject.prototype);
ETEXT_DESC.prototype.constructor = ETEXT_DESC;
ETEXT_DESC.prototype.__class__ = ETEXT_DESC;
ETEXT_DESC.__cache__ = {};
Module['ETEXT_DESC'] = ETEXT_DESC;

  ETEXT_DESC.prototype['__destroy__'] = ETEXT_DESC.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_ETEXT_DESC___destroy___0(self);
};
// PageIterator
/** @suppress {undefinedVars, duplicate} */function PageIterator() { throw "cannot construct a PageIterator, no constructor in IDL" }
PageIterator.prototype = Object.create(WrapperObject.prototype);
PageIterator.prototype.constructor = PageIterator;
PageIterator.prototype.__class__ = PageIterator;
PageIterator.__cache__ = {};
Module['PageIterator'] = PageIterator;

PageIterator.prototype['Begin'] = PageIterator.prototype.Begin = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_PageIterator_Begin_0(self);
};;

PageIterator.prototype['RestartParagraph'] = PageIterator.prototype.RestartParagraph = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_PageIterator_RestartParagraph_0(self);
};;

PageIterator.prototype['IsWithinFirstTextlineOfParagraph'] = PageIterator.prototype.IsWithinFirstTextlineOfParagraph = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_PageIterator_IsWithinFirstTextlineOfParagraph_0(self));
};;

PageIterator.prototype['RestartRow'] = PageIterator.prototype.RestartRow = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_PageIterator_RestartRow_0(self);
};;

PageIterator.prototype['Next'] = PageIterator.prototype.Next = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return !!(_emscripten_bind_PageIterator_Next_1(self, level));
};;

PageIterator.prototype['IsAtBeginningOf'] = PageIterator.prototype.IsAtBeginningOf = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return !!(_emscripten_bind_PageIterator_IsAtBeginningOf_1(self, level));
};;

PageIterator.prototype['IsAtFinalElement'] = PageIterator.prototype.IsAtFinalElement = /** @suppress {undefinedVars, duplicate} */function(level, element) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (element && typeof element === 'object') element = element.ptr;
  return !!(_emscripten_bind_PageIterator_IsAtFinalElement_2(self, level, element));
};;

PageIterator.prototype['Cmp'] = PageIterator.prototype.Cmp = /** @suppress {undefinedVars, duplicate} */function(other) {
  var self = this.ptr;
  if (other && typeof other === 'object') other = other.ptr;
  return _emscripten_bind_PageIterator_Cmp_1(self, other);
};;

PageIterator.prototype['SetBoundingBoxComponents'] = PageIterator.prototype.SetBoundingBoxComponents = /** @suppress {undefinedVars, duplicate} */function(include_upper_dots, include_lower_dots) {
  var self = this.ptr;
  if (include_upper_dots && typeof include_upper_dots === 'object') include_upper_dots = include_upper_dots.ptr;
  if (include_lower_dots && typeof include_lower_dots === 'object') include_lower_dots = include_lower_dots.ptr;
  _emscripten_bind_PageIterator_SetBoundingBoxComponents_2(self, include_upper_dots, include_lower_dots);
};;

PageIterator.prototype['BoundingBox'] = PageIterator.prototype.BoundingBox = /** @suppress {undefinedVars, duplicate} */function(level, padding, left, top, right, bottom) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (padding && typeof padding === 'object') padding = padding.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  if (right && typeof right === 'object') right = right.ptr;
  if (bottom && typeof bottom === 'object') bottom = bottom.ptr;
  if (bottom === undefined) { return !!(_emscripten_bind_PageIterator_BoundingBox_5(self, level, padding, left, top, right)) }
  return !!(_emscripten_bind_PageIterator_BoundingBox_6(self, level, padding, left, top, right, bottom));
};;

PageIterator.prototype['BoundingBoxInternal'] = PageIterator.prototype.BoundingBoxInternal = /** @suppress {undefinedVars, duplicate} */function(level, left, top, right, bottom) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  if (right && typeof right === 'object') right = right.ptr;
  if (bottom && typeof bottom === 'object') bottom = bottom.ptr;
  return !!(_emscripten_bind_PageIterator_BoundingBoxInternal_5(self, level, left, top, right, bottom));
};;

PageIterator.prototype['Empty'] = PageIterator.prototype.Empty = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return !!(_emscripten_bind_PageIterator_Empty_1(self, level));
};;

PageIterator.prototype['BlockType'] = PageIterator.prototype.BlockType = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_PageIterator_BlockType_0(self);
};;

PageIterator.prototype['BlockPolygon'] = PageIterator.prototype.BlockPolygon = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_PageIterator_BlockPolygon_0(self), Pta);
};;

PageIterator.prototype['GetBinaryImage'] = PageIterator.prototype.GetBinaryImage = /** @suppress {undefinedVars, duplicate} */function(level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  return wrapPointer(_emscripten_bind_PageIterator_GetBinaryImage_1(self, level), Pix);
};;

PageIterator.prototype['GetImage'] = PageIterator.prototype.GetImage = /** @suppress {undefinedVars, duplicate} */function(level, padding, original_img, left, top) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (padding && typeof padding === 'object') padding = padding.ptr;
  if (original_img && typeof original_img === 'object') original_img = original_img.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  return wrapPointer(_emscripten_bind_PageIterator_GetImage_5(self, level, padding, original_img, left, top), Pix);
};;

PageIterator.prototype['Baseline'] = PageIterator.prototype.Baseline = /** @suppress {undefinedVars, duplicate} */function(level, x1, y1, x2, y2) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (x1 && typeof x1 === 'object') x1 = x1.ptr;
  if (y1 && typeof y1 === 'object') y1 = y1.ptr;
  if (x2 && typeof x2 === 'object') x2 = x2.ptr;
  if (y2 && typeof y2 === 'object') y2 = y2.ptr;
  return !!(_emscripten_bind_PageIterator_Baseline_5(self, level, x1, y1, x2, y2));
};;

PageIterator.prototype['Orientation'] = PageIterator.prototype.Orientation = /** @suppress {undefinedVars, duplicate} */function(orientation, writing_direction, textline_order, deskew_angle) {
  var self = this.ptr;
  if (orientation && typeof orientation === 'object') orientation = orientation.ptr;
  if (writing_direction && typeof writing_direction === 'object') writing_direction = writing_direction.ptr;
  if (textline_order && typeof textline_order === 'object') textline_order = textline_order.ptr;
  if (deskew_angle && typeof deskew_angle === 'object') deskew_angle = deskew_angle.ptr;
  _emscripten_bind_PageIterator_Orientation_4(self, orientation, writing_direction, textline_order, deskew_angle);
};;

PageIterator.prototype['ParagraphInfo'] = PageIterator.prototype.ParagraphInfo = /** @suppress {undefinedVars, duplicate} */function(justification, is_list_item, is_crown, first_line_indent) {
  var self = this.ptr;
  if (justification && typeof justification === 'object') justification = justification.ptr;
  if (is_list_item && typeof is_list_item === 'object') is_list_item = is_list_item.ptr;
  if (is_crown && typeof is_crown === 'object') is_crown = is_crown.ptr;
  if (first_line_indent && typeof first_line_indent === 'object') first_line_indent = first_line_indent.ptr;
  _emscripten_bind_PageIterator_ParagraphInfo_4(self, justification, is_list_item, is_crown, first_line_indent);
};;

  PageIterator.prototype['__destroy__'] = PageIterator.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_PageIterator___destroy___0(self);
};
// WritingDirection
/** @suppress {undefinedVars, duplicate} */function WritingDirection() { throw "cannot construct a WritingDirection, no constructor in IDL" }
WritingDirection.prototype = Object.create(WrapperObject.prototype);
WritingDirection.prototype.constructor = WritingDirection;
WritingDirection.prototype.__class__ = WritingDirection;
WritingDirection.__cache__ = {};
Module['WritingDirection'] = WritingDirection;

  WritingDirection.prototype['__destroy__'] = WritingDirection.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_WritingDirection___destroy___0(self);
};
// WordChoiceIterator
/** @suppress {undefinedVars, duplicate} */function WordChoiceIterator(result_it) {
  if (result_it && typeof result_it === 'object') result_it = result_it.ptr;
  this.ptr = _emscripten_bind_WordChoiceIterator_WordChoiceIterator_1(result_it);
  getCache(WordChoiceIterator)[this.ptr] = this;
};;
WordChoiceIterator.prototype = Object.create(WrapperObject.prototype);
WordChoiceIterator.prototype.constructor = WordChoiceIterator;
WordChoiceIterator.prototype.__class__ = WordChoiceIterator;
WordChoiceIterator.__cache__ = {};
Module['WordChoiceIterator'] = WordChoiceIterator;

WordChoiceIterator.prototype['Next'] = WordChoiceIterator.prototype.Next = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_WordChoiceIterator_Next_0(self));
};;

WordChoiceIterator.prototype['GetUTF8Text'] = WordChoiceIterator.prototype.GetUTF8Text = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_WordChoiceIterator_GetUTF8Text_0(self));
};;

WordChoiceIterator.prototype['Confidence'] = WordChoiceIterator.prototype.Confidence = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_WordChoiceIterator_Confidence_0(self);
};;

  WordChoiceIterator.prototype['__destroy__'] = WordChoiceIterator.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_WordChoiceIterator___destroy___0(self);
};
// Box
/** @suppress {undefinedVars, duplicate} */function Box() { throw "cannot construct a Box, no constructor in IDL" }
Box.prototype = Object.create(WrapperObject.prototype);
Box.prototype.constructor = Box;
Box.prototype.__class__ = Box;
Box.__cache__ = {};
Module['Box'] = Box;

  Box.prototype['get_x'] = Box.prototype.get_x = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Box_get_x_0(self);
};
    Object.defineProperty(Box.prototype, 'x', { get: Box.prototype.get_x });
  Box.prototype['get_y'] = Box.prototype.get_y = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Box_get_y_0(self);
};
    Object.defineProperty(Box.prototype, 'y', { get: Box.prototype.get_y });
  Box.prototype['get_w'] = Box.prototype.get_w = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Box_get_w_0(self);
};
    Object.defineProperty(Box.prototype, 'w', { get: Box.prototype.get_w });
  Box.prototype['get_h'] = Box.prototype.get_h = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Box_get_h_0(self);
};
    Object.defineProperty(Box.prototype, 'h', { get: Box.prototype.get_h });
  Box.prototype['get_refcount'] = Box.prototype.get_refcount = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Box_get_refcount_0(self);
};
    Object.defineProperty(Box.prototype, 'refcount', { get: Box.prototype.get_refcount });
  Box.prototype['__destroy__'] = Box.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_Box___destroy___0(self);
};
// TessPDFRenderer
/** @suppress {undefinedVars, duplicate} */function TessPDFRenderer(outputbase, datadir, textonly) {
  ensureCache.prepare();
  if (outputbase && typeof outputbase === 'object') outputbase = outputbase.ptr;
  else outputbase = ensureString(outputbase);
  if (datadir && typeof datadir === 'object') datadir = datadir.ptr;
  else datadir = ensureString(datadir);
  if (textonly && typeof textonly === 'object') textonly = textonly.ptr;
  this.ptr = _emscripten_bind_TessPDFRenderer_TessPDFRenderer_3(outputbase, datadir, textonly);
  getCache(TessPDFRenderer)[this.ptr] = this;
};;
TessPDFRenderer.prototype = Object.create(WrapperObject.prototype);
TessPDFRenderer.prototype.constructor = TessPDFRenderer;
TessPDFRenderer.prototype.__class__ = TessPDFRenderer;
TessPDFRenderer.__cache__ = {};
Module['TessPDFRenderer'] = TessPDFRenderer;

TessPDFRenderer.prototype['BeginDocument'] = TessPDFRenderer.prototype.BeginDocument = /** @suppress {undefinedVars, duplicate} */function(title) {
  var self = this.ptr;
  ensureCache.prepare();
  if (title && typeof title === 'object') title = title.ptr;
  else title = ensureString(title);
  return !!(_emscripten_bind_TessPDFRenderer_BeginDocument_1(self, title));
};;

TessPDFRenderer.prototype['AddImage'] = TessPDFRenderer.prototype.AddImage = /** @suppress {undefinedVars, duplicate} */function(api) {
  var self = this.ptr;
  if (api && typeof api === 'object') api = api.ptr;
  return !!(_emscripten_bind_TessPDFRenderer_AddImage_1(self, api));
};;

TessPDFRenderer.prototype['EndDocument'] = TessPDFRenderer.prototype.EndDocument = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_TessPDFRenderer_EndDocument_0(self));
};;

TessPDFRenderer.prototype['happy'] = TessPDFRenderer.prototype.happy = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_TessPDFRenderer_happy_0(self));
};;

TessPDFRenderer.prototype['file_extension'] = TessPDFRenderer.prototype.file_extension = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessPDFRenderer_file_extension_0(self));
};;

TessPDFRenderer.prototype['title'] = TessPDFRenderer.prototype.title = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessPDFRenderer_title_0(self));
};;

TessPDFRenderer.prototype['imagenum'] = TessPDFRenderer.prototype.imagenum = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessPDFRenderer_imagenum_0(self);
};;

  TessPDFRenderer.prototype['__destroy__'] = TessPDFRenderer.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessPDFRenderer___destroy___0(self);
};
// PixaPtr
/** @suppress {undefinedVars, duplicate} */function PixaPtr() { throw "cannot construct a PixaPtr, no constructor in IDL" }
PixaPtr.prototype = Object.create(WrapperObject.prototype);
PixaPtr.prototype.constructor = PixaPtr;
PixaPtr.prototype.__class__ = PixaPtr;
PixaPtr.__cache__ = {};
Module['PixaPtr'] = PixaPtr;

  PixaPtr.prototype['__destroy__'] = PixaPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_PixaPtr___destroy___0(self);
};
// FloatPtr
/** @suppress {undefinedVars, duplicate} */function FloatPtr() { throw "cannot construct a FloatPtr, no constructor in IDL" }
FloatPtr.prototype = Object.create(WrapperObject.prototype);
FloatPtr.prototype.constructor = FloatPtr;
FloatPtr.prototype.__class__ = FloatPtr;
FloatPtr.__cache__ = {};
Module['FloatPtr'] = FloatPtr;

  FloatPtr.prototype['__destroy__'] = FloatPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_FloatPtr___destroy___0(self);
};
// ChoiceIterator
/** @suppress {undefinedVars, duplicate} */function ChoiceIterator(result_it) {
  if (result_it && typeof result_it === 'object') result_it = result_it.ptr;
  this.ptr = _emscripten_bind_ChoiceIterator_ChoiceIterator_1(result_it);
  getCache(ChoiceIterator)[this.ptr] = this;
};;
ChoiceIterator.prototype = Object.create(WrapperObject.prototype);
ChoiceIterator.prototype.constructor = ChoiceIterator;
ChoiceIterator.prototype.__class__ = ChoiceIterator;
ChoiceIterator.__cache__ = {};
Module['ChoiceIterator'] = ChoiceIterator;

ChoiceIterator.prototype['Next'] = ChoiceIterator.prototype.Next = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_ChoiceIterator_Next_0(self));
};;

ChoiceIterator.prototype['GetUTF8Text'] = ChoiceIterator.prototype.GetUTF8Text = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ChoiceIterator_GetUTF8Text_0(self));
};;

ChoiceIterator.prototype['Confidence'] = ChoiceIterator.prototype.Confidence = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_ChoiceIterator_Confidence_0(self);
};;

  ChoiceIterator.prototype['__destroy__'] = ChoiceIterator.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_ChoiceIterator___destroy___0(self);
};
// PixPtr
/** @suppress {undefinedVars, duplicate} */function PixPtr() { throw "cannot construct a PixPtr, no constructor in IDL" }
PixPtr.prototype = Object.create(WrapperObject.prototype);
PixPtr.prototype.constructor = PixPtr;
PixPtr.prototype.__class__ = PixPtr;
PixPtr.__cache__ = {};
Module['PixPtr'] = PixPtr;

  PixPtr.prototype['__destroy__'] = PixPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_PixPtr___destroy___0(self);
};
// UNICHARSET
/** @suppress {undefinedVars, duplicate} */function UNICHARSET() { throw "cannot construct a UNICHARSET, no constructor in IDL" }
UNICHARSET.prototype = Object.create(WrapperObject.prototype);
UNICHARSET.prototype.constructor = UNICHARSET;
UNICHARSET.prototype.__class__ = UNICHARSET;
UNICHARSET.__cache__ = {};
Module['UNICHARSET'] = UNICHARSET;

UNICHARSET.prototype['get_script_from_script_id'] = UNICHARSET.prototype.get_script_from_script_id = /** @suppress {undefinedVars, duplicate} */function(id) {
  var self = this.ptr;
  if (id && typeof id === 'object') id = id.ptr;
  return UTF8ToString(_emscripten_bind_UNICHARSET_get_script_from_script_id_1(self, id));
};;

UNICHARSET.prototype['get_script_id_from_name'] = UNICHARSET.prototype.get_script_id_from_name = /** @suppress {undefinedVars, duplicate} */function(script_name) {
  var self = this.ptr;
  ensureCache.prepare();
  if (script_name && typeof script_name === 'object') script_name = script_name.ptr;
  else script_name = ensureString(script_name);
  return _emscripten_bind_UNICHARSET_get_script_id_from_name_1(self, script_name);
};;

UNICHARSET.prototype['get_script_table_size'] = UNICHARSET.prototype.get_script_table_size = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_UNICHARSET_get_script_table_size_0(self);
};;

  UNICHARSET.prototype['__destroy__'] = UNICHARSET.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_UNICHARSET___destroy___0(self);
};
// IntPtr
/** @suppress {undefinedVars, duplicate} */function IntPtr() { throw "cannot construct a IntPtr, no constructor in IDL" }
IntPtr.prototype = Object.create(WrapperObject.prototype);
IntPtr.prototype.constructor = IntPtr;
IntPtr.prototype.__class__ = IntPtr;
IntPtr.__cache__ = {};
Module['IntPtr'] = IntPtr;

  IntPtr.prototype['__destroy__'] = IntPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_IntPtr___destroy___0(self);
};
// Orientation
/** @suppress {undefinedVars, duplicate} */function Orientation() { throw "cannot construct a Orientation, no constructor in IDL" }
Orientation.prototype = Object.create(WrapperObject.prototype);
Orientation.prototype.constructor = Orientation;
Orientation.prototype.__class__ = Orientation;
Orientation.__cache__ = {};
Module['Orientation'] = Orientation;

  Orientation.prototype['__destroy__'] = Orientation.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_Orientation___destroy___0(self);
};
// OSBestResult
/** @suppress {undefinedVars, duplicate} */function OSBestResult() { throw "cannot construct a OSBestResult, no constructor in IDL" }
OSBestResult.prototype = Object.create(WrapperObject.prototype);
OSBestResult.prototype.constructor = OSBestResult;
OSBestResult.prototype.__class__ = OSBestResult;
OSBestResult.__cache__ = {};
Module['OSBestResult'] = OSBestResult;

  OSBestResult.prototype['get_orientation_id'] = OSBestResult.prototype.get_orientation_id = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_OSBestResult_get_orientation_id_0(self);
};
    Object.defineProperty(OSBestResult.prototype, 'orientation_id', { get: OSBestResult.prototype.get_orientation_id });
  OSBestResult.prototype['get_script_id'] = OSBestResult.prototype.get_script_id = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_OSBestResult_get_script_id_0(self);
};
    Object.defineProperty(OSBestResult.prototype, 'script_id', { get: OSBestResult.prototype.get_script_id });
  OSBestResult.prototype['get_sconfidence'] = OSBestResult.prototype.get_sconfidence = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_OSBestResult_get_sconfidence_0(self);
};
    Object.defineProperty(OSBestResult.prototype, 'sconfidence', { get: OSBestResult.prototype.get_sconfidence });
  OSBestResult.prototype['get_oconfidence'] = OSBestResult.prototype.get_oconfidence = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_OSBestResult_get_oconfidence_0(self);
};
    Object.defineProperty(OSBestResult.prototype, 'oconfidence', { get: OSBestResult.prototype.get_oconfidence });
  OSBestResult.prototype['__destroy__'] = OSBestResult.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_OSBestResult___destroy___0(self);
};
// Boxa
/** @suppress {undefinedVars, duplicate} */function Boxa() { throw "cannot construct a Boxa, no constructor in IDL" }
Boxa.prototype = Object.create(WrapperObject.prototype);
Boxa.prototype.constructor = Boxa;
Boxa.prototype.__class__ = Boxa;
Boxa.__cache__ = {};
Module['Boxa'] = Boxa;

  Boxa.prototype['get_n'] = Boxa.prototype.get_n = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Boxa_get_n_0(self);
};
    Object.defineProperty(Boxa.prototype, 'n', { get: Boxa.prototype.get_n });
  Boxa.prototype['get_nalloc'] = Boxa.prototype.get_nalloc = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Boxa_get_nalloc_0(self);
};
    Object.defineProperty(Boxa.prototype, 'nalloc', { get: Boxa.prototype.get_nalloc });
  Boxa.prototype['get_refcount'] = Boxa.prototype.get_refcount = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Boxa_get_refcount_0(self);
};
    Object.defineProperty(Boxa.prototype, 'refcount', { get: Boxa.prototype.get_refcount });
  Boxa.prototype['get_box'] = Boxa.prototype.get_box = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Boxa_get_box_0(self), BoxPtr);
};
    Object.defineProperty(Boxa.prototype, 'box', { get: Boxa.prototype.get_box });
  Boxa.prototype['__destroy__'] = Boxa.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_Boxa___destroy___0(self);
};
// PixColormap
/** @suppress {undefinedVars, duplicate} */function PixColormap() { throw "cannot construct a PixColormap, no constructor in IDL" }
PixColormap.prototype = Object.create(WrapperObject.prototype);
PixColormap.prototype.constructor = PixColormap;
PixColormap.prototype.__class__ = PixColormap;
PixColormap.__cache__ = {};
Module['PixColormap'] = PixColormap;

  PixColormap.prototype['get_array'] = PixColormap.prototype.get_array = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_PixColormap_get_array_0(self);
};
    Object.defineProperty(PixColormap.prototype, 'array', { get: PixColormap.prototype.get_array });
  PixColormap.prototype['get_depth'] = PixColormap.prototype.get_depth = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_PixColormap_get_depth_0(self);
};
    Object.defineProperty(PixColormap.prototype, 'depth', { get: PixColormap.prototype.get_depth });
  PixColormap.prototype['get_nalloc'] = PixColormap.prototype.get_nalloc = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_PixColormap_get_nalloc_0(self);
};
    Object.defineProperty(PixColormap.prototype, 'nalloc', { get: PixColormap.prototype.get_nalloc });
  PixColormap.prototype['get_n'] = PixColormap.prototype.get_n = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_PixColormap_get_n_0(self);
};
    Object.defineProperty(PixColormap.prototype, 'n', { get: PixColormap.prototype.get_n });
  PixColormap.prototype['__destroy__'] = PixColormap.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_PixColormap___destroy___0(self);
};
// Pta
/** @suppress {undefinedVars, duplicate} */function Pta() { throw "cannot construct a Pta, no constructor in IDL" }
Pta.prototype = Object.create(WrapperObject.prototype);
Pta.prototype.constructor = Pta;
Pta.prototype.__class__ = Pta;
Pta.__cache__ = {};
Module['Pta'] = Pta;

  Pta.prototype['get_n'] = Pta.prototype.get_n = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pta_get_n_0(self);
};
    Object.defineProperty(Pta.prototype, 'n', { get: Pta.prototype.get_n });
  Pta.prototype['get_nalloc'] = Pta.prototype.get_nalloc = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pta_get_nalloc_0(self);
};
    Object.defineProperty(Pta.prototype, 'nalloc', { get: Pta.prototype.get_nalloc });
  Pta.prototype['get_refcount'] = Pta.prototype.get_refcount = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pta_get_refcount_0(self);
};
    Object.defineProperty(Pta.prototype, 'refcount', { get: Pta.prototype.get_refcount });
  Pta.prototype['get_x'] = Pta.prototype.get_x = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Pta_get_x_0(self), FloatPtr);
};
    Object.defineProperty(Pta.prototype, 'x', { get: Pta.prototype.get_x });
  Pta.prototype['get_y'] = Pta.prototype.get_y = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Pta_get_y_0(self), FloatPtr);
};
    Object.defineProperty(Pta.prototype, 'y', { get: Pta.prototype.get_y });
  Pta.prototype['__destroy__'] = Pta.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_Pta___destroy___0(self);
};
// Pix
/** @suppress {undefinedVars, duplicate} */function Pix() { throw "cannot construct a Pix, no constructor in IDL" }
Pix.prototype = Object.create(WrapperObject.prototype);
Pix.prototype.constructor = Pix;
Pix.prototype.__class__ = Pix;
Pix.__cache__ = {};
Module['Pix'] = Pix;

  Pix.prototype['get_w'] = Pix.prototype.get_w = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_w_0(self);
};
    Object.defineProperty(Pix.prototype, 'w', { get: Pix.prototype.get_w });
  Pix.prototype['get_h'] = Pix.prototype.get_h = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_h_0(self);
};
    Object.defineProperty(Pix.prototype, 'h', { get: Pix.prototype.get_h });
  Pix.prototype['get_d'] = Pix.prototype.get_d = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_d_0(self);
};
    Object.defineProperty(Pix.prototype, 'd', { get: Pix.prototype.get_d });
  Pix.prototype['get_spp'] = Pix.prototype.get_spp = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_spp_0(self);
};
    Object.defineProperty(Pix.prototype, 'spp', { get: Pix.prototype.get_spp });
  Pix.prototype['get_wpl'] = Pix.prototype.get_wpl = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_wpl_0(self);
};
    Object.defineProperty(Pix.prototype, 'wpl', { get: Pix.prototype.get_wpl });
  Pix.prototype['get_refcount'] = Pix.prototype.get_refcount = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_refcount_0(self);
};
    Object.defineProperty(Pix.prototype, 'refcount', { get: Pix.prototype.get_refcount });
  Pix.prototype['get_xres'] = Pix.prototype.get_xres = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_xres_0(self);
};
    Object.defineProperty(Pix.prototype, 'xres', { get: Pix.prototype.get_xres });
  Pix.prototype['get_yres'] = Pix.prototype.get_yres = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_yres_0(self);
};
    Object.defineProperty(Pix.prototype, 'yres', { get: Pix.prototype.get_yres });
  Pix.prototype['get_informat'] = Pix.prototype.get_informat = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_informat_0(self);
};
    Object.defineProperty(Pix.prototype, 'informat', { get: Pix.prototype.get_informat });
  Pix.prototype['get_special'] = Pix.prototype.get_special = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_special_0(self);
};
    Object.defineProperty(Pix.prototype, 'special', { get: Pix.prototype.get_special });
  Pix.prototype['get_text'] = Pix.prototype.get_text = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_Pix_get_text_0(self));
};
    Object.defineProperty(Pix.prototype, 'text', { get: Pix.prototype.get_text });
  Pix.prototype['get_colormap'] = Pix.prototype.get_colormap = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Pix_get_colormap_0(self), PixColormap);
};
    Object.defineProperty(Pix.prototype, 'colormap', { get: Pix.prototype.get_colormap });
  Pix.prototype['get_data'] = Pix.prototype.get_data = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pix_get_data_0(self);
};
    Object.defineProperty(Pix.prototype, 'data', { get: Pix.prototype.get_data });
  Pix.prototype['__destroy__'] = Pix.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_Pix___destroy___0(self);
};
// DoublePtr
/** @suppress {undefinedVars, duplicate} */function DoublePtr() { throw "cannot construct a DoublePtr, no constructor in IDL" }
DoublePtr.prototype = Object.create(WrapperObject.prototype);
DoublePtr.prototype.constructor = DoublePtr;
DoublePtr.prototype.__class__ = DoublePtr;
DoublePtr.__cache__ = {};
Module['DoublePtr'] = DoublePtr;

  DoublePtr.prototype['__destroy__'] = DoublePtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_DoublePtr___destroy___0(self);
};
// Dawg
/** @suppress {undefinedVars, duplicate} */function Dawg() { throw "cannot construct a Dawg, no constructor in IDL" }
Dawg.prototype = Object.create(WrapperObject.prototype);
Dawg.prototype.constructor = Dawg;
Dawg.prototype.__class__ = Dawg;
Dawg.__cache__ = {};
Module['Dawg'] = Dawg;

  Dawg.prototype['__destroy__'] = Dawg.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_Dawg___destroy___0(self);
};
// BoxPtr
/** @suppress {undefinedVars, duplicate} */function BoxPtr() { throw "cannot construct a BoxPtr, no constructor in IDL" }
BoxPtr.prototype = Object.create(WrapperObject.prototype);
BoxPtr.prototype.constructor = BoxPtr;
BoxPtr.prototype.__class__ = BoxPtr;
BoxPtr.__cache__ = {};
Module['BoxPtr'] = BoxPtr;

  BoxPtr.prototype['__destroy__'] = BoxPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_BoxPtr___destroy___0(self);
};
// TessBaseAPI
/** @suppress {undefinedVars, duplicate} */function TessBaseAPI() {
  this.ptr = _emscripten_bind_TessBaseAPI_TessBaseAPI_0();
  getCache(TessBaseAPI)[this.ptr] = this;
};;
TessBaseAPI.prototype = Object.create(WrapperObject.prototype);
TessBaseAPI.prototype.constructor = TessBaseAPI;
TessBaseAPI.prototype.__class__ = TessBaseAPI;
TessBaseAPI.__cache__ = {};
Module['TessBaseAPI'] = TessBaseAPI;

TessBaseAPI.prototype['Version'] = TessBaseAPI.prototype.Version = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_Version_0(self));
};;

TessBaseAPI.prototype['SetInputName'] = TessBaseAPI.prototype.SetInputName = /** @suppress {undefinedVars, duplicate} */function(name) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name);
  _emscripten_bind_TessBaseAPI_SetInputName_1(self, name);
};;

TessBaseAPI.prototype['GetInputName'] = TessBaseAPI.prototype.GetInputName = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetInputName_0(self));
};;

TessBaseAPI.prototype['SetInputImage'] = TessBaseAPI.prototype.SetInputImage = /** @suppress {undefinedVars, duplicate} */function(pix) {
  var self = this.ptr;
  if (pix && typeof pix === 'object') pix = pix.ptr;
  _emscripten_bind_TessBaseAPI_SetInputImage_1(self, pix);
};;

TessBaseAPI.prototype['GetInputImage'] = TessBaseAPI.prototype.GetInputImage = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetInputImage_0(self), Pix);
};;

TessBaseAPI.prototype['GetSourceYResolution'] = TessBaseAPI.prototype.GetSourceYResolution = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessBaseAPI_GetSourceYResolution_0(self);
};;

TessBaseAPI.prototype['GetDatapath'] = TessBaseAPI.prototype.GetDatapath = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetDatapath_0(self));
};;

TessBaseAPI.prototype['SetOutputName'] = TessBaseAPI.prototype.SetOutputName = /** @suppress {undefinedVars, duplicate} */function(name) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name);
  _emscripten_bind_TessBaseAPI_SetOutputName_1(self, name);
};;

TessBaseAPI.prototype['SetVariable'] = TessBaseAPI.prototype.SetVariable = /** @suppress {undefinedVars, duplicate} */function(name, value) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name);
  if (value && typeof value === 'object') value = value.ptr;
  else value = ensureString(value);
  return !!(_emscripten_bind_TessBaseAPI_SetVariable_2(self, name, value));
};;

TessBaseAPI.prototype['SetDebugVariable'] = TessBaseAPI.prototype.SetDebugVariable = /** @suppress {undefinedVars, duplicate} */function(name, value) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name);
  if (value && typeof value === 'object') value = value.ptr;
  else value = ensureString(value);
  return !!(_emscripten_bind_TessBaseAPI_SetDebugVariable_2(self, name, value));
};;

TessBaseAPI.prototype['GetIntVariable'] = TessBaseAPI.prototype.GetIntVariable = /** @suppress {undefinedVars, duplicate} */function(name, value) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name);
  if (value && typeof value === 'object') value = value.ptr;
  return !!(_emscripten_bind_TessBaseAPI_GetIntVariable_2(self, name, value));
};;

TessBaseAPI.prototype['GetBoolVariable'] = TessBaseAPI.prototype.GetBoolVariable = /** @suppress {undefinedVars, duplicate} */function(name, value) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name);
  if (value && typeof value === 'object') value = value.ptr;
  return !!(_emscripten_bind_TessBaseAPI_GetBoolVariable_2(self, name, value));
};;

TessBaseAPI.prototype['GetDoubleVariable'] = TessBaseAPI.prototype.GetDoubleVariable = /** @suppress {undefinedVars, duplicate} */function(name, value) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name);
  if (value && typeof value === 'object') value = value.ptr;
  return !!(_emscripten_bind_TessBaseAPI_GetDoubleVariable_2(self, name, value));
};;

TessBaseAPI.prototype['GetStringVariable'] = TessBaseAPI.prototype.GetStringVariable = /** @suppress {undefinedVars, duplicate} */function(name) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name);
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetStringVariable_1(self, name));
};;

TessBaseAPI.prototype['Init'] = TessBaseAPI.prototype.Init = /** @suppress {undefinedVars, duplicate} */function(datapath, language, oem, configFilename) {

  
  if (oem === undefined && configFilename !== undefined) oem = 3;

  var self = this.ptr;
  ensureCache.prepare();
  if (datapath && typeof datapath === 'object') datapath = datapath.ptr;
  else datapath = ensureString(datapath);
  if (language && typeof language === 'object') language = language.ptr;
  else language = ensureString(language);
  if (configFilename && typeof configFilename === 'object') configFilename = configFilename.ptr;
  else configFilename = ensureString(configFilename);
  if (oem && typeof oem === 'object') oem = oem.ptr;
  // OEM 3 (OEM_DEFAULT) is the default
  if (oem === undefined && configFilename !== undefined) {return _emscripten_bind_TessBaseAPI_Init_4(self, datapath, language, 3, configFilename)}
  if (oem === undefined) { return _emscripten_bind_TessBaseAPI_Init_2(self, datapath, language) };
  if (configFilename === undefined) {return _emscripten_bind_TessBaseAPI_Init_3(self, datapath, language, oem)};
  return _emscripten_bind_TessBaseAPI_Init_4(self, datapath, language, oem, configFilename);
};;

TessBaseAPI.prototype['GetInitLanguagesAsString'] = TessBaseAPI.prototype.GetInitLanguagesAsString = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetInitLanguagesAsString_0(self));
};;

TessBaseAPI.prototype['InitForAnalysePage'] = TessBaseAPI.prototype.InitForAnalysePage = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessBaseAPI_InitForAnalysePage_0(self);
};;

TessBaseAPI.prototype['SaveParameters'] = TessBaseAPI.prototype.SaveParameters = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessBaseAPI_SaveParameters_1(self);
};;

TessBaseAPI.prototype['RestoreParameters'] = TessBaseAPI.prototype.RestoreParameters = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessBaseAPI_RestoreParameters_1(self);
};;

TessBaseAPI.prototype['ReadConfigFile'] = TessBaseAPI.prototype.ReadConfigFile = /** @suppress {undefinedVars, duplicate} */function(filename) {
  var self = this.ptr;
  ensureCache.prepare();
  if (filename && typeof filename === 'object') filename = filename.ptr;
  else filename = ensureString(filename);
  _emscripten_bind_TessBaseAPI_ReadConfigFile_1(self, filename);
};;

TessBaseAPI.prototype['ReadDebugConfigFile'] = TessBaseAPI.prototype.ReadDebugConfigFile = /** @suppress {undefinedVars, duplicate} */function(filename) {
  var self = this.ptr;
  ensureCache.prepare();
  if (filename && typeof filename === 'object') filename = filename.ptr;
  else filename = ensureString(filename);
  _emscripten_bind_TessBaseAPI_ReadDebugConfigFile_1(self, filename);
};;

TessBaseAPI.prototype['SetPageSegMode'] = TessBaseAPI.prototype.SetPageSegMode = /** @suppress {undefinedVars, duplicate} */function(mode) {
  var self = this.ptr;
  if (mode && typeof mode === 'object') mode = mode.ptr;
  _emscripten_bind_TessBaseAPI_SetPageSegMode_1(self, mode);
};;

TessBaseAPI.prototype['GetPageSegMode'] = TessBaseAPI.prototype.GetPageSegMode = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessBaseAPI_GetPageSegMode_0(self);
};;

TessBaseAPI.prototype['TesseractRect'] = TessBaseAPI.prototype.TesseractRect = /** @suppress {undefinedVars, duplicate} */function(imagedata, bytes_per_pixel, bytes_per_line, left, top, width, height) {
  var self = this.ptr;
  if (imagedata && typeof imagedata === 'object') imagedata = imagedata.ptr;
  if (bytes_per_pixel && typeof bytes_per_pixel === 'object') bytes_per_pixel = bytes_per_pixel.ptr;
  if (bytes_per_line && typeof bytes_per_line === 'object') bytes_per_line = bytes_per_line.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  if (width && typeof width === 'object') width = width.ptr;
  if (height && typeof height === 'object') height = height.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_TesseractRect_7(self, imagedata, bytes_per_pixel, bytes_per_line, left, top, width, height));
};;

TessBaseAPI.prototype['ClearAdaptiveClassifier'] = TessBaseAPI.prototype.ClearAdaptiveClassifier = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessBaseAPI_ClearAdaptiveClassifier_0(self);
};;

TessBaseAPI.prototype['SetImage'] = TessBaseAPI.prototype.SetImage = /** @suppress {undefinedVars, duplicate} */function(imagedata, width, height, bytes_per_pixel, bytes_per_line, exif = 1, angle = 0) {
  var self = this.ptr;
  if (imagedata && typeof imagedata === 'object') imagedata = imagedata.ptr;
  if (width && typeof width === 'object') width = width.ptr;
  if (height && typeof height === 'object') height = height.ptr;
  if (bytes_per_pixel && typeof bytes_per_pixel === 'object') bytes_per_pixel = bytes_per_pixel.ptr;
  if (bytes_per_line && typeof bytes_per_line === 'object') bytes_per_line = bytes_per_line.ptr;
  if (width === undefined || width === null) { _emscripten_bind_TessBaseAPI_SetImage_1(self, imagedata, exif, angle);  return }
  _emscripten_bind_TessBaseAPI_SetImage_5(self, imagedata, width, height, bytes_per_pixel, bytes_per_line, exif, angle);
};;

TessBaseAPI.prototype['SetImageFile'] = TessBaseAPI.prototype.SetImageFile = /** @suppress {undefinedVars, duplicate} */function(exif = 1, angle = 0){
  var self = this.ptr;
  return _emscripten_bind_TessBaseAPI_SetImageFile_1(self, exif, angle);
}

TessBaseAPI.prototype['SetSourceResolution'] = TessBaseAPI.prototype.SetSourceResolution = /** @suppress {undefinedVars, duplicate} */function(ppi) {
  var self = this.ptr;
  if (ppi && typeof ppi === 'object') ppi = ppi.ptr;
  _emscripten_bind_TessBaseAPI_SetSourceResolution_1(self, ppi);
};;

TessBaseAPI.prototype['SetRectangle'] = TessBaseAPI.prototype.SetRectangle = /** @suppress {undefinedVars, duplicate} */function(left, top, width, height) {
  var self = this.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  if (width && typeof width === 'object') width = width.ptr;
  if (height && typeof height === 'object') height = height.ptr;
  _emscripten_bind_TessBaseAPI_SetRectangle_4(self, left, top, width, height);
};;

TessBaseAPI.prototype['GetThresholdedImage'] = TessBaseAPI.prototype.GetThresholdedImage = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetThresholdedImage_0(self), Pix);
};;

TessBaseAPI.prototype['WriteImage'] = TessBaseAPI.prototype.WriteImage = /** @suppress {undefinedVars, duplicate} */function(type) {
  var self = this.ptr;
  _emscripten_bind_TessBaseAPI_WriteImage_0(self, type);
};;

TessBaseAPI.prototype['GetRegions'] = TessBaseAPI.prototype.GetRegions = /** @suppress {undefinedVars, duplicate} */function(pixa) {
  var self = this.ptr;
  if (pixa && typeof pixa === 'object') pixa = pixa.ptr;
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetRegions_1(self, pixa), Boxa);
};;

TessBaseAPI.prototype['GetTextlines'] = TessBaseAPI.prototype.GetTextlines = /** @suppress {undefinedVars, duplicate} */function(raw_image, raw_padding, pixa, blockids, paraids) {
  var self = this.ptr;
  if (raw_image && typeof raw_image === 'object') raw_image = raw_image.ptr;
  if (raw_padding && typeof raw_padding === 'object') raw_padding = raw_padding.ptr;
  if (pixa && typeof pixa === 'object') pixa = pixa.ptr;
  if (blockids && typeof blockids === 'object') blockids = blockids.ptr;
  if (paraids && typeof paraids === 'object') paraids = paraids.ptr;
  if (pixa === undefined) { return wrapPointer(_emscripten_bind_TessBaseAPI_GetTextlines_2(self, raw_image, raw_padding), Boxa) }
  if (blockids === undefined) { return wrapPointer(_emscripten_bind_TessBaseAPI_GetTextlines_3(self, raw_image, raw_padding, pixa), Boxa) }
  if (paraids === undefined) { return wrapPointer(_emscripten_bind_TessBaseAPI_GetTextlines_4(self, raw_image, raw_padding, pixa, blockids), Boxa) }
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetTextlines_5(self, raw_image, raw_padding, pixa, blockids, paraids), Boxa);
};;

TessBaseAPI.prototype['GetStrips'] = TessBaseAPI.prototype.GetStrips = /** @suppress {undefinedVars, duplicate} */function(pixa, blockids) {
  var self = this.ptr;
  if (pixa && typeof pixa === 'object') pixa = pixa.ptr;
  if (blockids && typeof blockids === 'object') blockids = blockids.ptr;
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetStrips_2(self, pixa, blockids), Boxa);
};;

TessBaseAPI.prototype['GetWords'] = TessBaseAPI.prototype.GetWords = /** @suppress {undefinedVars, duplicate} */function(pixa) {
  var self = this.ptr;
  if (pixa && typeof pixa === 'object') pixa = pixa.ptr;
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetWords_1(self, pixa), Boxa);
};;

TessBaseAPI.prototype['GetConnectedComponents'] = TessBaseAPI.prototype.GetConnectedComponents = /** @suppress {undefinedVars, duplicate} */function(cc) {
  var self = this.ptr;
  if (cc && typeof cc === 'object') cc = cc.ptr;
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetConnectedComponents_1(self, cc), Boxa);
};;

TessBaseAPI.prototype['GetComponentImages'] = TessBaseAPI.prototype.GetComponentImages = /** @suppress {undefinedVars, duplicate} */function(level, text_only, raw_image, raw_padding, pixa, blockids, paraids) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  if (text_only && typeof text_only === 'object') text_only = text_only.ptr;
  if (raw_image && typeof raw_image === 'object') raw_image = raw_image.ptr;
  if (raw_padding && typeof raw_padding === 'object') raw_padding = raw_padding.ptr;
  if (pixa && typeof pixa === 'object') pixa = pixa.ptr;
  if (blockids && typeof blockids === 'object') blockids = blockids.ptr;
  if (paraids && typeof paraids === 'object') paraids = paraids.ptr;
  if (pixa === undefined) { return wrapPointer(_emscripten_bind_TessBaseAPI_GetComponentImages_4(self, level, text_only, raw_image, raw_padding), Boxa) }
  if (blockids === undefined) { return wrapPointer(_emscripten_bind_TessBaseAPI_GetComponentImages_5(self, level, text_only, raw_image, raw_padding, pixa), Boxa) }
  if (paraids === undefined) { return wrapPointer(_emscripten_bind_TessBaseAPI_GetComponentImages_6(self, level, text_only, raw_image, raw_padding, pixa, blockids), Boxa) }
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetComponentImages_7(self, level, text_only, raw_image, raw_padding, pixa, blockids, paraids), Boxa);
};;

TessBaseAPI.prototype['GetThresholdedImageScaleFactor'] = TessBaseAPI.prototype.GetThresholdedImageScaleFactor = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessBaseAPI_GetThresholdedImageScaleFactor_0(self);
};;

TessBaseAPI.prototype['AnalyseLayout'] = TessBaseAPI.prototype.AnalyseLayout = /** @suppress {undefinedVars, duplicate} */function(merge_similar_words) {
  var self = this.ptr;
  if (merge_similar_words && typeof merge_similar_words === 'object') merge_similar_words = merge_similar_words.ptr;
  if (merge_similar_words === undefined) { return wrapPointer(_emscripten_bind_TessBaseAPI_AnalyseLayout_0(self), PageIterator) }
  return wrapPointer(_emscripten_bind_TessBaseAPI_AnalyseLayout_1(self, merge_similar_words), PageIterator);
};;

TessBaseAPI.prototype['Recognize'] = TessBaseAPI.prototype.Recognize = /** @suppress {undefinedVars, duplicate} */function(monitor) {
  var self = this.ptr;
  if (monitor && typeof monitor === 'object') monitor = monitor.ptr;
  return _emscripten_bind_TessBaseAPI_Recognize_1(self, monitor);
};;

TessBaseAPI.prototype['FindLines'] = TessBaseAPI.prototype.FindLines = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessBaseAPI_FindLines_0(self);
};;

TessBaseAPI.prototype['GetGradient'] = TessBaseAPI.prototype.GetGradient = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessBaseAPI_GetGradient_0(self);
};;

TessBaseAPI.prototype['ProcessPages'] = TessBaseAPI.prototype.ProcessPages = /** @suppress {undefinedVars, duplicate} */function(filename, retry_config, timeout_millisec, renderer) {
  var self = this.ptr;
  ensureCache.prepare();
  if (filename && typeof filename === 'object') filename = filename.ptr;
  else filename = ensureString(filename);
  if (retry_config && typeof retry_config === 'object') retry_config = retry_config.ptr;
  else retry_config = ensureString(retry_config);
  if (timeout_millisec && typeof timeout_millisec === 'object') timeout_millisec = timeout_millisec.ptr;
  if (renderer && typeof renderer === 'object') renderer = renderer.ptr;
  return !!(_emscripten_bind_TessBaseAPI_ProcessPages_4(self, filename, retry_config, timeout_millisec, renderer));
};;

TessBaseAPI.prototype['ProcessPage'] = TessBaseAPI.prototype.ProcessPage = /** @suppress {undefinedVars, duplicate} */function(pix, page_index, filename, retry_config, timeout_millisec, renderer) {
  var self = this.ptr;
  ensureCache.prepare();
  if (pix && typeof pix === 'object') pix = pix.ptr;
  if (page_index && typeof page_index === 'object') page_index = page_index.ptr;
  if (filename && typeof filename === 'object') filename = filename.ptr;
  else filename = ensureString(filename);
  if (retry_config && typeof retry_config === 'object') retry_config = retry_config.ptr;
  else retry_config = ensureString(retry_config);
  if (timeout_millisec && typeof timeout_millisec === 'object') timeout_millisec = timeout_millisec.ptr;
  if (renderer && typeof renderer === 'object') renderer = renderer.ptr;
  return !!(_emscripten_bind_TessBaseAPI_ProcessPage_6(self, pix, page_index, filename, retry_config, timeout_millisec, renderer));
};;

TessBaseAPI.prototype['GetIterator'] = TessBaseAPI.prototype.GetIterator = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetIterator_0(self), ResultIterator);
};;

TessBaseAPI.prototype['GetUTF8Text'] = TessBaseAPI.prototype.GetUTF8Text = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetUTF8Text_0(self));
};;

TessBaseAPI.prototype['GetHOCRText'] = TessBaseAPI.prototype.GetHOCRText = /** @suppress {undefinedVars, duplicate} */function(page_number) {
  var self = this.ptr;
  if (page_number && typeof page_number === 'object') page_number = page_number.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetHOCRText_1(self, page_number));
};;

TessBaseAPI.prototype['GetTSVText'] = TessBaseAPI.prototype.GetTSVText = /** @suppress {undefinedVars, duplicate} */function(page_number) {
  var self = this.ptr;
  if (page_number && typeof page_number === 'object') page_number = page_number.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetTSVText_1(self, page_number));
};;

TessBaseAPI.prototype['GetBoxText'] = TessBaseAPI.prototype.GetBoxText = /** @suppress {undefinedVars, duplicate} */function(page_number) {
  var self = this.ptr;
  if (page_number && typeof page_number === 'object') page_number = page_number.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetBoxText_1(self, page_number));
};;

TessBaseAPI.prototype['GetUNLVText'] = TessBaseAPI.prototype.GetUNLVText = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetUNLVText_0(self));
};;

TessBaseAPI.prototype['GetOsdText'] = TessBaseAPI.prototype.GetOsdText = /** @suppress {undefinedVars, duplicate} */function(page_number) {
  var self = this.ptr;
  if (page_number && typeof page_number === 'object') page_number = page_number.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetOsdText_1(self, page_number));
};;

TessBaseAPI.prototype['MeanTextConf'] = TessBaseAPI.prototype.MeanTextConf = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessBaseAPI_MeanTextConf_0(self);
};;

TessBaseAPI.prototype['AllWordConfidences'] = TessBaseAPI.prototype.AllWordConfidences = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_TessBaseAPI_AllWordConfidences_0(self), IntPtr);
};;

TessBaseAPI.prototype['AdaptToWordStr'] = TessBaseAPI.prototype.AdaptToWordStr = /** @suppress {undefinedVars, duplicate} */function(mode, wordstr) {
  var self = this.ptr;
  ensureCache.prepare();
  if (mode && typeof mode === 'object') mode = mode.ptr;
  if (wordstr && typeof wordstr === 'object') wordstr = wordstr.ptr;
  else wordstr = ensureString(wordstr);
  return !!(_emscripten_bind_TessBaseAPI_AdaptToWordStr_2(self, mode, wordstr));
};;

TessBaseAPI.prototype['Clear'] = TessBaseAPI.prototype.Clear = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessBaseAPI_Clear_0(self);
};;

TessBaseAPI.prototype['End'] = TessBaseAPI.prototype.End = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessBaseAPI_End_0(self);
};;

TessBaseAPI.prototype['ClearPersistentCache'] = TessBaseAPI.prototype.ClearPersistentCache = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessBaseAPI_ClearPersistentCache_0(self);
};;

TessBaseAPI.prototype['IsValidWord'] = TessBaseAPI.prototype.IsValidWord = /** @suppress {undefinedVars, duplicate} */function(word) {
  var self = this.ptr;
  ensureCache.prepare();
  if (word && typeof word === 'object') word = word.ptr;
  else word = ensureString(word);
  return _emscripten_bind_TessBaseAPI_IsValidWord_1(self, word);
};;

TessBaseAPI.prototype['IsValidCharacter'] = TessBaseAPI.prototype.IsValidCharacter = /** @suppress {undefinedVars, duplicate} */function(utf8_character) {
  var self = this.ptr;
  ensureCache.prepare();
  if (utf8_character && typeof utf8_character === 'object') utf8_character = utf8_character.ptr;
  else utf8_character = ensureString(utf8_character);
  return !!(_emscripten_bind_TessBaseAPI_IsValidCharacter_1(self, utf8_character));
};;

TessBaseAPI.prototype['DetectOS'] = TessBaseAPI.prototype.DetectOS = /** @suppress {undefinedVars, duplicate} */function(osr) {
  var self = this.ptr;
  if (osr && typeof osr === 'object') osr = osr.ptr;
  return !!(_emscripten_bind_TessBaseAPI_DetectOS_1(self, osr));
};;

TessBaseAPI.prototype['GetUnichar'] = TessBaseAPI.prototype.GetUnichar = /** @suppress {undefinedVars, duplicate} */function(unichar_id) {
  var self = this.ptr;
  if (unichar_id && typeof unichar_id === 'object') unichar_id = unichar_id.ptr;
  return UTF8ToString(_emscripten_bind_TessBaseAPI_GetUnichar_1(self, unichar_id));
};;

TessBaseAPI.prototype['GetDawg'] = TessBaseAPI.prototype.GetDawg = /** @suppress {undefinedVars, duplicate} */function(i) {
  var self = this.ptr;
  if (i && typeof i === 'object') i = i.ptr;
  return wrapPointer(_emscripten_bind_TessBaseAPI_GetDawg_1(self, i), Dawg);
};;

TessBaseAPI.prototype['NumDawgs'] = TessBaseAPI.prototype.NumDawgs = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessBaseAPI_NumDawgs_0(self);
};;

TessBaseAPI.prototype['oem'] = TessBaseAPI.prototype.oem = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_TessBaseAPI_oem_0(self);
};;

  TessBaseAPI.prototype['__destroy__'] = TessBaseAPI.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_TessBaseAPI___destroy___0(self);
};
// OSResults
/** @suppress {undefinedVars, duplicate} */function OSResults() {
  this.ptr = _emscripten_bind_OSResults_OSResults_0();
  getCache(OSResults)[this.ptr] = this;
};;
OSResults.prototype = Object.create(WrapperObject.prototype);
OSResults.prototype.constructor = OSResults;
OSResults.prototype.__class__ = OSResults;
OSResults.__cache__ = {};
Module['OSResults'] = OSResults;

OSResults.prototype['print_scores'] = OSResults.prototype.print_scores = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_OSResults_print_scores_0(self);
};;

  OSResults.prototype['get_best_result'] = OSResults.prototype.get_best_result = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_OSResults_get_best_result_0(self), OSBestResult);
};
    Object.defineProperty(OSResults.prototype, 'best_result', { get: OSResults.prototype.get_best_result });
  OSResults.prototype['get_unicharset'] = OSResults.prototype.get_unicharset = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_OSResults_get_unicharset_0(self), UNICHARSET);
};
    Object.defineProperty(OSResults.prototype, 'unicharset', { get: OSResults.prototype.get_unicharset });
  OSResults.prototype['__destroy__'] = OSResults.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_OSResults___destroy___0(self);
};
// Pixa
/** @suppress {undefinedVars, duplicate} */function Pixa() { throw "cannot construct a Pixa, no constructor in IDL" }
Pixa.prototype = Object.create(WrapperObject.prototype);
Pixa.prototype.constructor = Pixa;
Pixa.prototype.__class__ = Pixa;
Pixa.__cache__ = {};
Module['Pixa'] = Pixa;

  Pixa.prototype['get_n'] = Pixa.prototype.get_n = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pixa_get_n_0(self);
};
    Object.defineProperty(Pixa.prototype, 'n', { get: Pixa.prototype.get_n });
  Pixa.prototype['get_nalloc'] = Pixa.prototype.get_nalloc = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pixa_get_nalloc_0(self);
};
    Object.defineProperty(Pixa.prototype, 'nalloc', { get: Pixa.prototype.get_nalloc });
  Pixa.prototype['get_refcount'] = Pixa.prototype.get_refcount = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_Pixa_get_refcount_0(self);
};
    Object.defineProperty(Pixa.prototype, 'refcount', { get: Pixa.prototype.get_refcount });
  Pixa.prototype['get_pix'] = Pixa.prototype.get_pix = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Pixa_get_pix_0(self), PixPtr);
};
    Object.defineProperty(Pixa.prototype, 'pix', { get: Pixa.prototype.get_pix });
  Pixa.prototype['get_boxa'] = Pixa.prototype.get_boxa = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Pixa_get_boxa_0(self), Boxa);
};
    Object.defineProperty(Pixa.prototype, 'boxa', { get: Pixa.prototype.get_boxa });
  Pixa.prototype['__destroy__'] = Pixa.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_Pixa___destroy___0(self);
};
(function() {
  function setupEnums() {


    // PageIteratorLevel

    Module['RIL_BLOCK'] = _emscripten_enum_PageIteratorLevel_RIL_BLOCK();

    Module['RIL_PARA'] = _emscripten_enum_PageIteratorLevel_RIL_PARA();

    Module['RIL_TEXTLINE'] = _emscripten_enum_PageIteratorLevel_RIL_TEXTLINE();

    Module['RIL_WORD'] = _emscripten_enum_PageIteratorLevel_RIL_WORD();

    Module['RIL_SYMBOL'] = _emscripten_enum_PageIteratorLevel_RIL_SYMBOL();



    // OcrEngineMode

    Module['OEM_TESSERACT_ONLY'] = _emscripten_enum_OcrEngineMode_OEM_TESSERACT_ONLY();

    Module['OEM_LSTM_ONLY'] = _emscripten_enum_OcrEngineMode_OEM_LSTM_ONLY();

    Module['OEM_TESSERACT_LSTM_COMBINED'] = _emscripten_enum_OcrEngineMode_OEM_TESSERACT_LSTM_COMBINED();

    Module['OEM_DEFAULT'] = _emscripten_enum_OcrEngineMode_OEM_DEFAULT();

    Module['OEM_COUNT'] = _emscripten_enum_OcrEngineMode_OEM_COUNT();



    // WritingDirection_

    Module['WRITING_DIRECTION_LEFT_TO_RIGHT'] = _emscripten_enum_WritingDirection__WRITING_DIRECTION_LEFT_TO_RIGHT();

    Module['WRITING_DIRECTION_RIGHT_TO_LEFT'] = _emscripten_enum_WritingDirection__WRITING_DIRECTION_RIGHT_TO_LEFT();

    Module['WRITING_DIRECTION_TOP_TO_BOTTOM'] = _emscripten_enum_WritingDirection__WRITING_DIRECTION_TOP_TO_BOTTOM();



    // PolyBlockType

    Module['PT_UNKNOWN'] = _emscripten_enum_PolyBlockType_PT_UNKNOWN();

    Module['PT_FLOWING_TEXT'] = _emscripten_enum_PolyBlockType_PT_FLOWING_TEXT();

    Module['PT_HEADING_TEXT'] = _emscripten_enum_PolyBlockType_PT_HEADING_TEXT();

    Module['PT_PULLOUT_TEXT'] = _emscripten_enum_PolyBlockType_PT_PULLOUT_TEXT();

    Module['PT_EQUATION'] = _emscripten_enum_PolyBlockType_PT_EQUATION();

    Module['PT_INLINE_EQUATION'] = _emscripten_enum_PolyBlockType_PT_INLINE_EQUATION();

    Module['PT_TABLE'] = _emscripten_enum_PolyBlockType_PT_TABLE();

    Module['PT_VERTICAL_TEXT'] = _emscripten_enum_PolyBlockType_PT_VERTICAL_TEXT();

    Module['PT_CAPTION_TEXT'] = _emscripten_enum_PolyBlockType_PT_CAPTION_TEXT();

    Module['PT_FLOWING_IMAGE'] = _emscripten_enum_PolyBlockType_PT_FLOWING_IMAGE();

    Module['PT_HEADING_IMAGE'] = _emscripten_enum_PolyBlockType_PT_HEADING_IMAGE();

    Module['PT_PULLOUT_IMAGE'] = _emscripten_enum_PolyBlockType_PT_PULLOUT_IMAGE();

    Module['PT_HORZ_LINE'] = _emscripten_enum_PolyBlockType_PT_HORZ_LINE();

    Module['PT_VERT_LINE'] = _emscripten_enum_PolyBlockType_PT_VERT_LINE();

    Module['PT_NOISE'] = _emscripten_enum_PolyBlockType_PT_NOISE();

    Module['PT_COUNT'] = _emscripten_enum_PolyBlockType_PT_COUNT();



    // StrongScriptDirection

    Module['DIR_NEUTRAL'] = _emscripten_enum_StrongScriptDirection_DIR_NEUTRAL();

    Module['DIR_LEFT_TO_RIGHT'] = _emscripten_enum_StrongScriptDirection_DIR_LEFT_TO_RIGHT();

    Module['DIR_RIGHT_TO_LEFT'] = _emscripten_enum_StrongScriptDirection_DIR_RIGHT_TO_LEFT();

    Module['DIR_MIX'] = _emscripten_enum_StrongScriptDirection_DIR_MIX();



    // ParagraphJustification_

    Module['JUSTIFICATION_UNKNOWN'] = _emscripten_enum_ParagraphJustification__JUSTIFICATION_UNKNOWN();

    Module['JUSTIFICATION_LEFT'] = _emscripten_enum_ParagraphJustification__JUSTIFICATION_LEFT();

    Module['JUSTIFICATION_CENTER'] = _emscripten_enum_ParagraphJustification__JUSTIFICATION_CENTER();

    Module['JUSTIFICATION_RIGHT'] = _emscripten_enum_ParagraphJustification__JUSTIFICATION_RIGHT();



    // TextlineOrder_

    Module['TEXTLINE_ORDER_LEFT_TO_RIGHT'] = _emscripten_enum_TextlineOrder__TEXTLINE_ORDER_LEFT_TO_RIGHT();

    Module['TEXTLINE_ORDER_RIGHT_TO_LEFT'] = _emscripten_enum_TextlineOrder__TEXTLINE_ORDER_RIGHT_TO_LEFT();

    Module['TEXTLINE_ORDER_TOP_TO_BOTTOM'] = _emscripten_enum_TextlineOrder__TEXTLINE_ORDER_TOP_TO_BOTTOM();



    // Orientation_

    Module['ORIENTATION_PAGE_UP'] = _emscripten_enum_Orientation__ORIENTATION_PAGE_UP();

    Module['ORIENTATION_PAGE_RIGHT'] = _emscripten_enum_Orientation__ORIENTATION_PAGE_RIGHT();

    Module['ORIENTATION_PAGE_DOWN'] = _emscripten_enum_Orientation__ORIENTATION_PAGE_DOWN();

    Module['ORIENTATION_PAGE_LEFT'] = _emscripten_enum_Orientation__ORIENTATION_PAGE_LEFT();



    // PageSegMode

    Module['PSM_OSD_ONLY'] = _emscripten_enum_PageSegMode_PSM_OSD_ONLY();

    Module['PSM_AUTO_OSD'] = _emscripten_enum_PageSegMode_PSM_AUTO_OSD();

    Module['PSM_AUTO_ONLY'] = _emscripten_enum_PageSegMode_PSM_AUTO_ONLY();

    Module['PSM_AUTO'] = _emscripten_enum_PageSegMode_PSM_AUTO();

    Module['PSM_SINGLE_COLUMN'] = _emscripten_enum_PageSegMode_PSM_SINGLE_COLUMN();

    Module['PSM_SINGLE_BLOCK_VERT_TEXT'] = _emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK_VERT_TEXT();

    Module['PSM_SINGLE_BLOCK'] = _emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK();

    Module['PSM_SINGLE_LINE'] = _emscripten_enum_PageSegMode_PSM_SINGLE_LINE();

    Module['PSM_SINGLE_WORD'] = _emscripten_enum_PageSegMode_PSM_SINGLE_WORD();

    Module['PSM_CIRCLE_WORD'] = _emscripten_enum_PageSegMode_PSM_CIRCLE_WORD();

    Module['PSM_SINGLE_CHAR'] = _emscripten_enum_PageSegMode_PSM_SINGLE_CHAR();

    Module['PSM_SPARSE_TEXT'] = _emscripten_enum_PageSegMode_PSM_SPARSE_TEXT();

    Module['PSM_SPARSE_TEXT_OSD'] = _emscripten_enum_PageSegMode_PSM_SPARSE_TEXT_OSD();

    Module['PSM_RAW_LINE'] = _emscripten_enum_PageSegMode_PSM_RAW_LINE();

    Module['PSM_COUNT'] = _emscripten_enum_PageSegMode_PSM_COUNT();

  }
  if (runtimeInitialized) setupEnums();
  else addOnInit(setupEnums);
})();

// end include: /src/javascript/glue.js
// include: /src/javascript/anterior.js
BoolPtr.prototype['getValue'] = function(n){ return !!getValue(getPointer(this) + (n || 0) * 'i1') }
IntPtr.prototype['getValue'] = function(n){ return getValue(getPointer(this) + (n || 0) * 4, 'i32') }
FloatPtr.prototype['getValue'] = function(n){ return getValue(getPointer(this) + (n || 0) * 4, 'float') }
DoublePtr.prototype['getValue'] = function(n){ return getValue(getPointer(this) + (n || 0) * 8, 'double') }

BoxPtr.prototype['get'] = PixaPtr.prototype['get'] = PixPtr.prototype['get'] = 
	function(n){ return getValue(getPointer(this) + (n || 0) * 4, '*') }


function pointerHelper(){
	this.obj = {}
}
pointerHelper.prototype['wrap'] = function(name, type){
	var ptr = _malloc(4);
	setValue(ptr, 0, 'i32');
	return this.obj[name] = wrapPointer(ptr, type);
}
pointerHelper.prototype['bool'] = function(name){
	return this['wrap'](name, BoolPtr);
}
pointerHelper.prototype['i32'] = function(name){
	return this['wrap'](name, IntPtr);
}
pointerHelper.prototype['f32'] = function(name){ // NOTE: actual llvm codename is float
	return this['wrap'](name, FloatPtr);
}
pointerHelper.prototype['f64'] = function(name){ // NOTE BENE: llvm codename is double
	return this.obj[name] = wrapPointer(_malloc(8), DoublePtr)
}
pointerHelper.prototype['peek'] = function(){
	var obj = {};
	for(var name in this.obj){
		obj[name] = this.obj[name]['getValue']()
	}
	return obj;
}

pointerHelper.prototype['get'] = function(){
	var obj = {};
	for(var name in this.obj){
		obj[name] = this.obj[name]['getValue']()
		_free(getPointer(this.obj[name]))
	}
	return obj;
}

ResultIterator.prototype['getBoundingBox'] = function(level){
	var pt = new pointerHelper();
	this['BoundingBox'](level, pt['i32']('x0'), pt['i32']('y0'), pt['i32']('x1'), pt['i32']('y1'))
	return pt.get();
}


ResultIterator.prototype['getBaseline'] = function(pil){ // pi is the page iterator
	var pt = new pointerHelper();
	var has_baseline = !!this['Baseline'](pil,
						pt['i32']('x0'), pt['i32']('y0'),
						pt['i32']('x1'), pt['i32']('y1'));
	var obj = pt.get();
	obj['has_baseline'] = has_baseline;
	return obj;
}

ResultIterator.prototype['getWordFontAttributes'] =  function(){
	var pt = new pointerHelper();
	var fontName = this['WordFontAttributes'](pt['bool']('is_bold'),
										 pt['bool']('is_italic'),
										 pt['bool']('is_underlined'),
										 pt['bool']('is_monospace'),
										 pt['bool']('is_serif'),
										 pt['bool']('is_smallcaps'),
										 pt['i32']('pointsize'),
										 pt['i32']('font_id'));
	var obj = pt.get()
	obj['font_name'] = fontName;
	return obj;
}

Module['pointerHelper'] = pointerHelper;

// end include: /src/javascript/anterior.js


  return moduleArg.ready
}

);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = TesseractCore;
else if (typeof define === 'function' && define['amd'])
  define([], () => TesseractCore);
