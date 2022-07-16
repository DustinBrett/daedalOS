let ALLOW_PARAM_OVERRIDE_FROM_URL = true;
let SUPPRESS_WINEBOOT = true; //prevent wine from re-creating .wine directory
let ROOT = "/root";
let STORAGE_DROPBOX = "DROPBOX";
let STORAGE_LOCAL_STORAGE = "LOCAL_STORAGE";
let STORAGE_MEMORY = "MEMORY";

let ONDEMAND_DEFAULT = "notset";
let ONDEMAND_ROOT = "root";

let DROPBOX_APP_KEY = "put key in here";
let RECEIVE_URL = "http://put url in here/oauth_receiver.html";

let DEFAULT_AUTO_RUN = true;
let DEFAULT_SOUND_ENABLED = true;
let DEFAULT_APP_DIRECTORY = ROOT + "/files/";
let DEFAULT_BPP = 32;
let DEFAULT_FRAME_SKIP = "0";
let DEFAULT_RENDERER = "gdi";
let DEFAULT_ROOT_ZIP_FILE = "boxedwine.zip";
let TEMP = "/temp/";
let BFS_ROOT = "/";
//params
let Config = window.BoxedWineConfig || {};
Config.locateRootBaseUrl = "Program Files/BoxedWine";
Config.locateAppBaseUrl = "Program Files/BoxedWine";
Config.locateOverlayBaseUrl = "Program Files/BoxedWine";
Config.storageMode = STORAGE_MEMORY;
Config.isRunningInline = true;
Config.isRunning = false;
Config.showUploadDownload = false;
Config.recordLoadedFiles = false;
var recordedFiles = [];

var uniqueDirs = {};
var timer = null;
var index = 0;
var selectedItem;
var selectedFilename;
var files = []; //used for constructing tree and for retrieving files when zipping
var client = null;
var alreadyBuiltFileSystem = false;

var ae = document.createElement("a");
document.body.appendChild(ae);
ae.style = "display: none";
var url = null;

//recursive copy based on code in emularity github project
var flag_r = {
  isReadable: function () {
    return true;
  },
  isWriteable: function () {
    return false;
  },
  isTruncating: function () {
    return false;
  },
  isAppendable: function () {
    return false;
  },
  isSynchronous: function () {
    return false;
  },
  isExclusive: function () {
    return false;
  },
  pathExistsAction: function () {
    return 0;
  },
  pathNotExistsAction: function () {
    return 1;
  },
};
function logAndExit(msg) {
  window.BoxedWineConfig.consoleLog("FATAL ERROR: " + msg);
  throw new Error(msg);
}
function setConfiguration() {
  Config.appDirPrefix = DEFAULT_APP_DIRECTORY;
  Config.isAutoRunSet = getAutoRun();
  Config.rootZipFile = getRootZipFile("root"); //MANUAL:"base.zip";
  Config.extraZipFiles = getZipFileList("overlay"); //MANUAL:"dlls.zip;fonts.zip";
  Config.appZipFile = getAppZipFile("app"); //MANUAL:"chomp.zip";
  Config.appPayload = getPayload("app-payload");
  Config.extraPayload = getPayload("overlay-payload");
  Config.Program = getExecutable(); //MANUAL:"CHOMP.EXE";
  Config.WorkingDir = getWorkingDirectory(); //MANUAL:"";
  Config.isSoundEnabled = getSound();
  Config.bpp = getBitsPerPixel();
  Config.useRangeRequests = getUseRangeRequests();
  Config.glext = getGLExtensions();
  Config.cpu = getCPU();
  Config.envProp = getEnvProp();
  Config.emEnvProps = getEmscriptenEnvProps();
  Config.frameSkip = getFrameSkip();
  Config.directDrawRenderer = getDirectDrawRenderer();
  Config.cdromImage = getCDROMImage();
  Config.resolution = getResolution();
}
function allowParameterOverride() {
  if (Config.urlParams.length > 0) {
    return true;
  }
  return ALLOW_PARAM_OVERRIDE_FROM_URL;
}
function getEmscriptenEnvProps() {
  var props = getParameter("em-env").trim();
  let allProps = [];
  //allProps.push({key: 'LIBGL_NPOT', value: 2});
  //allProps.push({key: 'LIBGL_DEFAULT_WRAP', value: 0});
  //allProps.push({key: 'LIBGL_MIPMAP', value: 3});
  if (allowParameterOverride()) {
    if (props.length > 6) {
      if (
        (props.startsWith("%22") && props.endsWith("%22")) ||
        (props.startsWith("%27") && props.endsWith("%27"))
      ) {
        props = props.substring(3, props.length - 3);
        props = props.split("%20").join(" ");
        props
          .trim()
          .split(";")
          .forEach(function (item) {
            let kv = item.split(":");
            if (kv.length == 2) {
              let key = kv[0].trim();
              let value = kv[1].trim();
              let existingIndex = allProps.findIndex((v) => v.key === key);
              if (existingIndex > -1) {
                allProps.splice(existingIndex, 1);
              }
              allProps.push({ key: key, value: value });
            }
          });
      } else {
        window.BoxedWineConfig.consoleLog("EMSCRIPTEN ENV props parameter must be in quoted string");
      }
    }
  }
  if (allProps.length > 0) {
    window.BoxedWineConfig.consoleLog("setting EMSCRIPTEN ENV props:");
    allProps.forEach(function (prop) {
      window.BoxedWineConfig.consoleLog(prop.key + " = " + prop.value);
    });
  }
  return allProps;
}
function getEnvProp() {
  var property = getParameter("env").trim();
  if (allowParameterOverride()) {
    if (property.length > 6) {
      if (
        (property.startsWith("%22") && property.endsWith("%22")) ||
        (property.startsWith("%27") && property.endsWith("%27"))
      ) {
        let kv = property.substring(3, property.length - 3).split(":");
        return '"' + kv[0].trim() + "=" + kv[1].trim() + '"';
      } else {
        window.BoxedWineConfig.consoleLog("ENV property must be in quoted string");
      }
    }
  }
  return "";
}
function getCPU() {
  var cpu = getParameter("cpu");
  if (!allowParameterOverride()) {
    cpu = "";
  } else if (cpu == "p2") {
  } else if (cpu == "p3") {
  } else {
    cpu = "";
  }
  if (cpu.length > 0) {
    window.BoxedWineConfig.consoleLog("setting CPU to: " + cpu);
  }
  return cpu;
}
function getDirectDrawRenderer() {
  var renderer = getParameter("renderer");
  if (!allowParameterOverride()) {
    renderer = DEFAULT_RENDERER;
  } else if (renderer == "gdi" || renderer == "opengl") {
  } else {
    renderer = DEFAULT_RENDERER;
  }
  window.BoxedWineConfig.consoleLog("setting DirectDrawRenderer to: " + renderer);
  return renderer;
}
function getResolution() {
  var resolution = getParameter("resolution");
  if (!allowParameterOverride()) {
    resolution = null;
  } else {
    if (resolution != null) {
      if (resolution.indexOf("x") > -1) {
        let resNumbers = resolution.split("x");
        if (
          !(
            resNumbers.length == 2 &&
            isNumber(resNumbers[0]) &&
            isNumber(resNumbers[1])
          )
        ) {
          resolution = null;
        }
      } else {
        resolution = null;
      }
    }
  }
  if (resolution == null) {
    window.BoxedWineConfig.consoleLog("not setting Resolution");
  } else {
    window.BoxedWineConfig.consoleLog("setting Resolution to: " + resolution);
  }
  return resolution;
}
function isNumber(num) {
  const result = Number(num);
  return !isNaN(result) && result > 0 && result < 2000;
}
function getFrameSkip() {
  var frameskip = getParameter("skipFrameFPS");
  if (!allowParameterOverride()) {
    frameskip = DEFAULT_FRAME_SKIP;
  } else if (frameskip == "") {
    frameskip = DEFAULT_FRAME_SKIP;
  } else if (Number(frameskip) < 0 || Number(frameskip) > 50) {
    frameskip = DEFAULT_FRAME_SKIP;
  }
  window.BoxedWineConfig.consoleLog("setting skipFrameFPS to: " + frameskip);
  return frameskip;
}
function getBitsPerPixel() {
  var bpp = getParameter("bpp");
  if (!allowParameterOverride()) {
    bpp = DEFAULT_BPP;
  } else if (bpp == "8") {
    bpp = 8;
  } else if (bpp == "16") {
    bpp = 16;
  } else if (bpp == "32") {
    bpp = 32;
  } else {
    bpp = DEFAULT_BPP;
  }
  window.BoxedWineConfig.consoleLog("setting BPP to: " + bpp);
  return bpp;
}
function getGLExtensions() {
  //GL not yet available from JS
  var glext = getParameter("glext");
  if (!allowParameterOverride()) {
    glext = "";
  } else {
    if (glext.length > 6) {
      if (
        (glext.startsWith("%22") && glext.endsWith("%22")) ||
        (glext.startsWith("%27") && glext.endsWith("%27"))
      ) {
        glext = glext.substring(3, glext.length - 3);
        glext = glext.split("%20").join(" ");
        glext = '"' + glext + '"';
      } else {
        window.BoxedWineConfig.consoleLog("glext paramater must be in quoted string");
      }
    }
  }
  if (glext.length > 0) {
    window.BoxedWineConfig.consoleLog("setting glext to: " + glext);
  }
  return glext;
}
function getAutoRun() {
  var auto = getParameter("auto");
  if (!allowParameterOverride()) {
    auto = DEFAULT_AUTO_RUN;
  } else if (auto == "true") {
    auto = true;
  } else if (auto == "false") {
    auto = false;
  } else {
    auto = DEFAULT_AUTO_RUN;
  }
  if (!auto && Config.isRunningInline) {
    window.BoxedWineConfig.consoleLog(
      "parameter mismatch. Auto run can't be false if running inline. Resetting auto run to true"
    );
    auto = true;
  }
  window.BoxedWineConfig.consoleLog("setting auto run to: " + auto);
  return auto;
}
function getPayload(param) {
  var payload = getParameter(param);
  if (!allowParameterOverride()) {
    payload = "";
  }
  return payload;
}
function getUseRangeRequests() {
  var ondemand = getParameter("ondemand");

  if (!allowParameterOverride()) {
    ondemand = ONDEMAND_DEFAULT;
  } else if (ondemand == ONDEMAND_ROOT) {
  } else {
    ondemand = ONDEMAND_DEFAULT;
  }
  window.BoxedWineConfig.consoleLog("setting ondemand to: " + ondemand);
  return ondemand;
}
function getSound() {
  var soundEnabled = getParameter("sound");
  if (!allowParameterOverride()) {
    soundEnabled = DEFAULT_SOUND_ENABLED;
  } else if (soundEnabled == "true") {
    soundEnabled = true;
  } else if (soundEnabled == "false") {
    soundEnabled = false;
  } else {
    soundEnabled = DEFAULT_SOUND_ENABLED;
  }
  window.BoxedWineConfig.consoleLog("setting sound to: " + soundEnabled);
  return soundEnabled;
}
function getWorkingDirectory() {
  var dir = getParameter("work");
  if (!allowParameterOverride() || dir === "") {
    dir = "";
  } else {
    if (dir.startsWith("c:/")) {
      dir = "/home/username/.wine/dosdevices/c:/" + dir.substring(3);
      window.BoxedWineConfig.consoleLog("setting working directory to: " + dir);
    } else if (dir.startsWith("d:/")) {
      dir = "/home/username/.wine/dosdevices/d:/" + dir.substring(3);
      window.BoxedWineConfig.consoleLog("setting working directory to: " + dir);
    } else if (dir.startsWith("e:/")) {
      dir = "/home/username/.wine/dosdevices/e:/" + dir.substring(3);
      window.BoxedWineConfig.consoleLog("setting working directory to: " + dir);
    } else {
      window.BoxedWineConfig.consoleLog("unable to set work directory");
    }
  }
  return dir;
}
function getCDROMImage() {
  var filename = getParameter("iso");
  if (!allowParameterOverride() || filename === "") {
    filename = "";
    window.BoxedWineConfig.consoleLog("not setting cdrom iso image");
  } else {
    if (!filename.endsWith(".iso")) {
      filename = filename + ".iso";
    }
    window.BoxedWineConfig.consoleLog("setting cdrom iso image to: " + filename);
  }
  return filename;
}
function getAppZipFile(param) {
  var filename = getParameter(param);
  if (!allowParameterOverride() || filename === "") {
    filename = "";
    window.BoxedWineConfig.consoleLog("not setting " + param + " zip file");
  } else {
    if (!filename.endsWith(".zip")) {
      filename = filename + ".zip";
    }
    window.BoxedWineConfig.consoleLog("setting " + param + " zip file to: " + filename);
  }
  return filename;
}
function getRootZipFile(param) {
  var filename = getParameter(param);
  if (!allowParameterOverride() || filename === "") {
    filename = DEFAULT_ROOT_ZIP_FILE;
  } else {
    if (!filename.endsWith(".zip")) {
      filename = filename + ".zip";
    }
  }
  window.BoxedWineConfig.consoleLog("setting " + param + " zip file to: " + filename);
  return filename;
}
function getZipFileList(param) {
  var zipFiles = [];
  if (Config.isRunningInline) {
    let ondemandMinOverlay = getParameter(
      "inline-default-ondemand-root-overlay"
    );
    if (ondemandMinOverlay.length > 0) {
      if (!ondemandMinOverlay.endsWith(".zip")) {
        ondemandMinOverlay = ondemandMinOverlay + ".zip";
      }
      zipFiles.push(ondemandMinOverlay);
    }
  }
  var filenames = getParameter(param);
  if (!allowParameterOverride() || filename === "") {
    window.BoxedWineConfig.consoleLog("not setting " + param + " zip file(s)");
  } else {
    if (filenames.length > 0) {
      var zipFilenames = filenames.split(";");
      for (var i = 0; i < zipFilenames.length; i++) {
        var filename = zipFilenames[i];
        if (!filename.endsWith(".zip")) {
          filename = filename + ".zip";
        }
        zipFiles.push(filename);
      }
    }
  }
  if (zipFiles.length > 0) {
    window.BoxedWineConfig.consoleLog("setting " + param + " zip file(s) to: " + zipFiles);
  }
  return zipFiles;
}
function auth_callback(error) {
  if (error) {
    console.error("Authentication error: " + error);
    return;
  }
  if (client.isAuthenticated()) {
    if (alreadyBuiltFileSystem) {
      return;
    }
    alreadyBuiltFileSystem = true;
    window.BoxedWineConfig.consoleLog("authenticated!");
    buildFileSystem(new BrowserFS.FileSystem.InMemory(), true);
  } else {
    console.error("unable to authenticate");
  }
}
function dropboxLogin() {
  client = new Dropbox.Client({ key: DROPBOX_APP_KEY });
  client.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl: RECEIVE_URL }));
  client.authenticate(auth_callback);
}
function initFileSystem() {
  window.BoxedWineConfig.consoleLog("Use Storage mode: " + Config.storageMode);
  if (Config.storageMode === STORAGE_LOCAL_STORAGE) {
    var writableStorage;
    if (BrowserFS.FileSystem.LocalStorage.isAvailable) {
      writableStorage = new BrowserFS.FileSystem.LocalStorage();
    } else {
      writableStorage = new BrowserFS.FileSystem.InMemory();
      window.BoxedWineConfig.consoleLog(
        "Switching to In Memory store as LocalStorage is not available"
      );
    }
    buildFileSystem(writableStorage, false);
  } else if (Config.storageMode === STORAGE_DROPBOX) {
    client.authenticate({ interactive: false }, auth_callback);
  } else {
    buildFileSystem(new BrowserFS.FileSystem.InMemory(), false);
  }
}
//function from browserfs
function syncGet(url, offset, length) {
  let req = new XMLHttpRequest();
  req.open("GET", Config.locateRootBaseUrl + url, false);
  let data = null;
  let err = null;
  // Classic hack to download binary data as a string.
  req.overrideMimeType("text/plain; charset=x-user-defined");
  let end = offset + length - 1;
  let range = "bytes=" + offset + "-" + end;
  req.setRequestHeader("Range", range);
  req.onreadystatechange = function (e) {
    if (req.readyState === 4) {
      if (req.status === 200 || req.status === 206) {
        // Convert the text into a buffer.
        const text = req.responseText;
        data = new Int8Array(text.length);
        // Throw away the upper bits of each character.
        for (let i = 0; i < text.length; i++) {
          // This will automatically throw away the upper bit of each
          // character for us.
          data[i] = text.charCodeAt(i);
        }
        return;
      } else {
        err = "XHR error.";
        return;
      }
    }
  };
  req.send();
  if (err) {
    throw err;
  }
  return data;
}
function getFileSize(p) {
  return new Promise(function (resolve, reject) {
    const req = new XMLHttpRequest();
    req.open("HEAD", Config.locateRootBaseUrl + p);
    req.onreadystatechange = function (e) {
      if (req.readyState === 4) {
        if (req.status === 200) {
          try {
            resolve(
              parseInt(req.getResponseHeader("Content-Length") || "-1", 10)
            );
          } catch (e) {
            throw e;
          }
        } else {
          throw new Error("Unable to get file size");
        }
      }
    };
    req.onerror = function () {
      reject(Error("Network Error"));
    };
    req.send();
  }).then(
    function (result, err) {
      if (err != null) {
        throw new Error(err);
      } else {
        return result;
      }
    },
    function (err) {
      throw new Error("Something when wrong when getting file size");
    }
  );
}
function getCentralOffset(buffer) {
  let ENDSIG = 101010256;
  let ENDHDR = 22;
  let ENDTOT = 10;
  let ENDSIZ = 12;
  let ENDOFF = 16;
  let ENDNRD = 4;
  var pos = 0;
  var offset = buffer.byteLength - ENDHDR;
  var top = Math.max(0, offset - 65536);
  var result = 0;
  do {
    if (offset < top) throw new Error("not a zip file?");
    pos = offset--;
    result =
      buffer[pos++] |
      (buffer[pos++] << 8) |
      ((buffer[pos++] | (buffer[pos++] << 8)) << 16);
  } while (result != ENDSIG);
  pos = pos + ENDTOT - ENDNRD;
  var count = buffer[pos++] | (buffer[pos++] << 8);
  pos = pos + ENDOFF - ENDSIZ;
  return (
    buffer[pos++] |
    (buffer[pos++] << 8) |
    ((buffer[pos++] | (buffer[pos++] << 8)) << 16)
  );
}
function buildFileSystem(writableStorage, isDropBox) {
  var Buffer = BrowserFS.BFSRequire("buffer").Buffer;
  buildCDROMFileSystem(Buffer, function (cdromfs) {
    buildExtraFileSystems(Buffer, function (extraFSs) {
      buildAppFileSystems(function (homeAdapter) {
        if (Config.useRangeRequests == ONDEMAND_ROOT) {
          buildRemoteZipFile(Config.rootZipFile, function callback(zipfs) {
            buildBrowserFileSystem(
              writableStorage,
              isDropBox,
              homeAdapter,
              extraFSs,
              zipfs,
              cdromfs
            );
          });
        } else {
          var rootListingObject = {};
          rootListingObject[Config.rootZipFile] = null;
          BrowserFS.FileSystem.XmlHttpRequest.Create(
            { index: rootListingObject, baseUrl: Config.locateRootBaseUrl },
            function (e2, xmlHttpFs) {
              if (e2) {
                logAndExit(e2);
              }
              var rootMfs = new BrowserFS.FileSystem.MountableFileSystem();
              rootMfs.mount("/temp", xmlHttpFs);
              rootMfs.readFile(
                TEMP + Config.rootZipFile,
                null,
                flag_r,
                function callback(e, contents) {
                  if (e) {
                    logAndExit(e);
                  }
                  BrowserFS.FileSystem.ZipFS.Create(
                    { zipData: new Buffer(contents) },
                    function (e3, zipfs) {
                      if (e3) {
                        logAndExit(e3);
                      }
                      buildBrowserFileSystem(
                        writableStorage,
                        isDropBox,
                        homeAdapter,
                        extraFSs,
                        zipfs,
                        cdromfs
                      );
                    }
                  );
                  rootMfs = null;
                }
              );
            }
          );
        }
      });
    });
  });
}
function buildRemoteZipFile(zipFilename, zipFileCallback) {
  var Buffer = BrowserFS.BFSRequire("buffer").Buffer;
  getFileSize(zipFilename).then(function (fileSizeAsString) {
    let fileSizeAsInt = Number(fileSizeAsString);
    let blockSize = fileSizeAsInt > 100000 ? 100000 : fileSizeAsInt - 22;
    let lastPartOfFile = syncGet(
      zipFilename,
      fileSizeAsInt - blockSize,
      blockSize
    );
    let centralOffset = getCentralOffset(new Uint8Array(lastPartOfFile));
    let remainingLength = fileSizeAsInt - centralOffset;
    let contents = syncGet(zipFilename, centralOffset, remainingLength);
    BrowserFS.FileSystem.ZipFS.Create(
      {
        name: Config.locateRootBaseUrl + zipFilename,
        zipData: new Buffer(contents),
      },
      function (e3, zipfs) {
        if (e3) {
          logAndExit(e3);
        }
        zipFileCallback(zipfs);
      }
    );
  });
}
function getBase64Data(base64Data) {
  let bytes = atob(base64Data);
  let contentLength = bytes.length;
  var contents = new Uint8Array(contentLength);
  for (var i = 0; i < contentLength; i++) {
    contents[i] = bytes.charCodeAt(i);
  }
  return contents;
}
function buildAppFileSystems(adapterCallback) {
  var Buffer = BrowserFS.BFSRequire("buffer").Buffer;
  if (Config.appPayload.length > 0) {
    let contents = getBase64Data(Config.appPayload);
    BrowserFS.FileSystem.ZipFS.Create(
      { zipData: new Buffer(contents) },
      function (e4, additionalZipfs) {
        if (e4) {
          logAndExit(e4);
        }
        let homeAdapter = new BrowserFS.FileSystem.FolderAdapter(
          BFS_ROOT,
          additionalZipfs
        );
        adapterCallback(homeAdapter);
      }
    );
  } else if (Config.appZipFile.length > 0) {
    var listingObject = {};
    listingObject[Config.appZipFile] = null;
    var mfs = new BrowserFS.FileSystem.MountableFileSystem();
    BrowserFS.FileSystem.XmlHttpRequest.Create(
      { index: listingObject, baseUrl: Config.locateAppBaseUrl },
      function (e2, xmlHttpFs) {
        if (e2) {
          logAndExit(e2);
        }
        mfs.mount("/temp", xmlHttpFs);
        mfs.readFile(
          TEMP + Config.appZipFile,
          null,
          flag_r,
          function callback(e, contents) {
            if (e) {
              logAndExit(e);
            }
            BrowserFS.FileSystem.ZipFS.Create(
              { zipData: new Buffer(contents) },
              function (e3, additionalZipfs) {
                if (e3) {
                  logAndExit(e3);
                }
                let homeAdapter = new BrowserFS.FileSystem.FolderAdapter(
                  BFS_ROOT,
                  additionalZipfs
                );
                adapterCallback(homeAdapter);
                mfs = null;
              }
            );
          }
        );
      }
    );
  } else {
    let homeAdapter = new BrowserFS.FileSystem.FolderAdapter(
      BFS_ROOT,
      new BrowserFS.FileSystem.InMemory()
    );
    adapterCallback(homeAdapter);
  }
}
function buildExtraFileSystems(Buffer, fsCallback) {
  var extraFSs = [];
  if (Config.extraPayload.length > 0) {
    let contents = getBase64Data(Config.extraPayload);
    BrowserFS.FileSystem.ZipFS.Create(
      { zipData: new Buffer(contents) },
      function (e2, zipfs) {
        if (e2) {
          logAndExit(e2);
        }
        extraFSs.push(zipfs);
        fsCallback(extraFSs);
      }
    );
  } else if (Config.extraZipFiles.length > 0) {
    for (let i = 0; i < Config.extraZipFiles.length; i++) {
      var listingObject = {};
      listingObject[Config.extraZipFiles[i]] = null;
      var mfs = new BrowserFS.FileSystem.MountableFileSystem();
      BrowserFS.FileSystem.XmlHttpRequest.Create(
        { index: listingObject, baseUrl: Config.locateOverlayBaseUrl },
        function (e2, xmlHttpFs) {
          if (e2) {
            logAndExit(e2);
          }
          mfs.mount("/temp", xmlHttpFs);
          mfs.readFile(
            TEMP + Config.extraZipFiles[i],
            null,
            flag_r,
            function (e, contents) {
              if (e) {
                logAndExit(e);
              }
              BrowserFS.FileSystem.ZipFS.Create(
                { zipData: new Buffer(contents) },
                function (e3, zipfs) {
                  if (e3) {
                    logAndExit(e3);
                  }
                  extraFSs.push(zipfs);
                  if (extraFSs.length == Config.extraZipFiles.length) {
                    fsCallback(extraFSs);
                  }
                  mfs = null;
                }
              );
            }
          );
        }
      );
    }
  } else {
    fsCallback(extraFSs);
  }
}
function buildCDROMFileSystem(Buffer, fsCallback) {
  if (Config.cdromImage.length > 0) {
    var listingObject = {};
    listingObject[Config.cdromImage] = null;
    var mfs = new BrowserFS.FileSystem.MountableFileSystem();
    BrowserFS.FileSystem.XmlHttpRequest.Create(
      { index: listingObject, baseUrl: Config.locateAppBaseUrl },
      function (e2, xmlHttpFs) {
        if (e2) {
          logAndExit(e2);
        }
        mfs.mount("/temp", xmlHttpFs);
        mfs.readFile(
          TEMP + Config.cdromImage,
          null,
          flag_r,
          function callback(e, contents) {
            if (e) {
              logAndExit(e);
            }
            BrowserFS.FileSystem.IsoFS.Create(
              { data: new Buffer(contents) },
              function (e3, cdromFS) {
                if (e3) {
                  logAndExit(e3);
                }
                fsCallback(cdromFS);
                mfs = null;
              }
            );
          }
        );
      }
    );
  } else {
    fsCallback(null);
  }
}
function buildBrowserFileSystem(
  writableStorage,
  isDropBox,
  homeAdapter,
  extraFSs,
  zipfs,
  cdromfs
) {
  FS.createPath(FS.root, "root", FS.createPath);
  FS.createPath("/root", "base", true, true);
  FS.createPath("/root", "files", true, true);
  FS.createPath("/root", "cdrom", true, false);
  var mainfs = null;

  BrowserFS.FileSystem.OverlayFS.Create(
    { readable: zipfs, writable: new BrowserFS.FileSystem.InMemory() },
    function (e3, rootOverlay) {
      if (e3) {
        logAndExit(e3);
      }
      if (SUPPRESS_WINEBOOT) {
        deleteFile(rootOverlay, "/lib/wine/wineboot.exe.so");
      }

      homeAdapter.initialize(function callback(e) {
        if (e) {
          logAndExit(e);
        }
        BrowserFS.FileSystem.OverlayFS.Create(
          { readable: homeAdapter, writable: writableStorage },
          function (e2, homeOverlay) {
            if (e2) {
              logAndExit(e2);
            }
            if (isDropBox) {
              var mirrorFS = new BrowserFS.FileSystem.AsyncMirror(
                homeOverlay,
                new BrowserFS.FileSystem.Dropbox(client)
              );
              mirrorFS.initialize(function callback(e4) {
                if (e4) {
                  logAndExit(e4);
                }
                postBuildFileSystem(rootOverlay, mirrorFS, extraFSs, cdromfs);
              });
            } else {
              postBuildFileSystem(rootOverlay, homeOverlay, extraFSs, cdromfs);
            }
          }
        );
      });
    }
  );
}
function postBuildFileSystem(rootFS, homeFS, extraFSs, cdromFS) {
  var mfs = new BrowserFS.FileSystem.MountableFileSystem();
  mfs.mount("/root/base", rootFS);
  mfs.mount(
    Config.appDirPrefix.substring(0, Config.appDirPrefix.length - 1),
    homeFS
  );
  if (cdromFS != null) {
    mfs.mount("/root/cdrom", cdromFS);
  }
  var BFS = new BrowserFS.EmscriptenFS();

  BrowserFS.initialize(mfs);
  FS.mount(BFS, { root: "/root" }, "/root");

  for (let i = 0; i < extraFSs.length; i++) {
    recursiveCopy(extraFSs[i], Config.extraZipFiles[i], "/");
  }
  extraFSs = null;
  setDirectDrawRenderer(Config.directDrawRenderer);

  toggleConsole();
  if (Config.isAutoRunSet) {
    start();
  }
}
function deleteFile(fs, pathAndFilename) {
  try {
    fs.unlinkSync(pathAndFilename);
  } catch (ef) {
    window.BoxedWineConfig.consoleLog("Unable to delete:" + pathAndFilename + " error:" + ef.message);
  }
}
function createFolders(mainfs, folders) {
  var directory = "";
  for (var k = 0; k < folders.length; k++) {
    if (folders[k].length > 0) {
      directory = directory + "/" + folders[k];
      mainfs.mkdirSync(directory);
    }
  }
}
function recursiveCopy(fs, zipFilename, filename) {
  var prefix =
    zipFilename == null
      ? ""
      : "/" + zipFilename.substring(0, zipFilename.length - 4);
  var path = BrowserFS.BFSRequire("path");
  copyDirectory(fs, filename, prefix);
  function copyDirectory(fs, filename, prefix) {
    createFolderIfNecessary(filename, prefix);
    fs.readdirSync(filename).forEach(function (item) {
      var file = path.resolve(filename, item);
      if (!(file.startsWith("/__MACOSX") || file.endsWith(".DS_Store"))) {
        if (fs.statSync(file).isDirectory()) {
          copyDirectory(fs, file, prefix);
        } else {
          createFileIfNecessary(fs, file, prefix);
        }
      }
    });
  }
}
function createFileIfNecessary(fs, fullPath, prefix) {
  var file = fullPath;
  if (fullPath.startsWith(prefix)) {
    fullPath = fullPath.substring(prefix.length);
  }
  var parent = extractFirstPartOfPath(fullPath);
  if (parent.length > 0) {
    var filename = extractLastPartOfPath(fullPath);
    var contents = fs.readFileSync(file, null, flag_r);
    try {
      window.BoxedWineConfig.consoleLog("creating: root/base" + parent + "/" + filename);
      FS.createDataFile("root/base" + parent, filename, contents, true, true);
    } catch (ef) {
      if (ef.message === "File exists" || ef.message === "FS error") {
        try {
          FS.unlink("root/base" + parent + "/" + filename);
          FS.createDataFile(
            "root/base" + parent,
            filename,
            contents,
            true,
            true
          );
        } catch (ef) {
          window.BoxedWineConfig.consoleLog(
            "file replace error:" +
              ef.message +
              " for: " +
              parent +
              "/" +
              filename
          );
        }
      } else {
        window.BoxedWineConfig.consoleLog(
          "file creation error:" +
            ef.message +
            " for: " +
            parent +
            "/" +
            filename
        );
      }
    }
  }
}
//todo use stat!
function createFolderIfNecessary(fullPath, prefix) {
  if (fullPath.startsWith(prefix)) {
    fullPath = fullPath.substring(prefix.length);
  }
  var parent = extractFirstPartOfPath(fullPath);
  var dir = extractLastPartOfPath(fullPath);
  if (parent.length > 0) {
    try {
      FS.lookupPath("/root/base" + parent + "/" + dir, { follow: true });
    } catch (ef) {
      if (
        ef.message == "No such file or directory" ||
        ef.message === "FS error"
      ) {
        try {
          FS.createPath("/root/base/" + parent, dir, true, true);
        } catch (cef) {
          window.BoxedWineConfig.consoleLog(
            "Directory creation error:" +
              cef.message +
              " for: " +
              parent +
              "/" +
              dir
          );
        }
      } else if (ef.message != "File exists") {
        window.BoxedWineConfig.consoleLog(
          "Directory creation error:" +
            ef.message +
            " for: " +
            parent +
            "/" +
            dir
        );
      }
    }
  }
}
function start() {
  if (Config.isRunning) {
    return;
  }
  startEmulator();
}
function startEmulator() {
  Config.isRunning = true;

  var params = getEmulatorParams();
  for (var i = 0; i < params.length; i++) {
    Module["arguments"].push(params[i]);
  }

  Module["removeRunDependency"]("setupBoxedWine");
}
var initialSetup = function () {
  window.BoxedWineConfig.consoleLog("running initial setup");
  setConfiguration();
  if (Config.emEnvProps.length > 0) {
    Config.emEnvProps.forEach(function (prop) {
      ENV[prop.key] = prop.value;
    });
  }

  Module["addRunDependency"]("setupBoxedWine");
  initFileSystem();
};
function getExecutable() {
  var prog = getParameter("p");
  if (!allowParameterOverride() || prog === "") {
    window.BoxedWineConfig.consoleLog("not setting program to execute");
  } else {
    if (prog.startsWith("%22") && prog.endsWith("%22")) {
      prog = prog.substring(3, prog.length - 3);
    } else if (prog.startsWith("%27") && prog.endsWith("%27")) {
      prog = prog.substring(3, prog.length - 3);
    }
    prog = prog.split("%20").join(" ");
    window.BoxedWineConfig.consoleLog("setting program to execute to: " + prog);
  }
  return prog;
}
var errorCallback = function (e) {
  window.BoxedWineConfig.consoleLog(e);
};
function getEntriesAsPromise(item, exeFiles, allFiles) {
  var dirCount = 0;
  return new Promise((resolve, reject) => {
    if (item.isDirectory) {
      dirCount = dirCount + 1;
      let reader = item.createReader();
      let doBatch = () => {
        reader.readEntries((entries) => {
          if (entries.length > 0) {
            entries.forEach(function (entry) {
              getEntriesAsPromise(entry, exeFiles, allFiles);
            });
            doBatch();
          } else {
            dirCount = dirCount - 1;
            if (dirCount == 0) {
              if (!Config.isAutoRunSet && !Config.isRunning) {
                loadExeModal(exeFiles, allFiles);
              }
            }
            resolve();
          }
        }, reject);
      };
      doBatch();
    } else {
      let fullPath = item.fullPath;
      let uppercase = fullPath.toUpperCase();
      allFiles.push(fullPath);
      if (uppercase.endsWith(".EXE") || uppercase.endsWith(".BAT")) {
        exeFiles.push(fullPath);
      }
      item.file(function (item) {
        uploadFile(item, fullPath, allFiles);
      }, errorCallback);
    }
  });
}
function loadExeModal(exeFiles, allFiles) {
  timer = setInterval(function () {
    readyCheck(exeFiles, allFiles);
  }, 100);
}
function populateModalExe(exeFiles) {}
function execute(filename) {
  var file = extractLastPartOfPath(filename);
  var path = extractFirstPartOfPath(filename);

  Config.WorkingDir = "/home/username/.wine/dosdevices/d:/" + path.substring(1);
  Config.Program = file;

  startEmulator();
}
function readyCheck(exeFiles, allFiles) {
  if (allFiles.length == 0) {
    clearInterval(timer);
    populateModalExe(exeFiles);
  }
}
function isInSubDirectory(fullPath, programDir) {
  var fileEntry = FS.lookupPath(fullPath, { follow: true });
  if (fileEntry != null && fileEntry.node.isFolder) {
    var entries = FS.readdir(fullPath).filter(function (param) {
      return param !== "." && param !== ".." && param !== "__MACOSX";
    });
    for (var idx = 0; idx < entries.length; idx++) {
      if (entries[idx] === programDir) {
        return true;
      }
    }
  }
  return false;
}
function setDirectDrawRenderer(val) {
  let fileLocation = "root/base/home/username/.wine/user.reg";
  let data = FS.readFile(fileLocation, { encoding: "utf8" });
  let keyIndex = data.indexOf('"DirectDrawRenderer');
  if (keyIndex != -1) {
    let endOfKeyLineIndex = data.indexOf("\n", keyIndex + 1);
    if (endOfKeyLineIndex != -1) {
      //"DirectDrawRenderer\"=\"opengl\""
      //let keyLine = data.substring(keyIndex, endOfKeyLineIndex);
      //window.BoxedWineConfig.consoleLog(keyLine);
      let replacementLine = '"DirectDrawRenderer"="' + val + '"';
      let newData =
        data.substring(0, keyIndex) +
        replacementLine +
        data.substring(endOfKeyLineIndex, data.length);
      FS.writeFile(fileLocation, newData);
    } else {
      window.BoxedWineConfig.consoleLog("Unable to set DirectDrawRenderer in user.reg");
    }
  } else {
    window.BoxedWineConfig.consoleLog("Unable to find DirectDrawRenderer in user.reg");
  }
}
function getEmulatorParams() {
  var params = ["-root", "/root/base"];
  params.push("-mount_drive");
  params.push(Config.appDirPrefix);
  params.push("d");
  params.push("-nozip");

  if (Config.cdromImage.length > 0) {
    params.push("-mount_drive");
    params.push("/root/cdrom");
    params.push("e");
  }

  if (Config.resolution != null) {
    params.push("-resolution");
    params.push(Config.resolution);
  }

  if (Config.frameSkip != "0") {
    params.push("-skipFrameFPS");
    params.push(Config.frameSkip);
  }

  if (!Config.isSoundEnabled) {
    params.push("-nosound");
  }
  if (Config.bpp != DEFAULT_BPP) {
    params.push("-bpp");
    params.push("" + Config.bpp);
  }
  if (Config.cpu.length > 0) {
    params.push("-" + Config.cpu);
  }
  if (Config.glext.length > 0) {
    params.push("-glext");
    params.push(Config.glext);
  }
  if (Config.envProp.length > 0) {
    params.push("-env");
    params.push(Config.envProp);
  }

  if (Config.WorkingDir.length > 0) {
    params.push("-w");
    params.push(Config.WorkingDir);
  } else if (
    Config.appPayload.length > 0 &&
    Config.Program.length > 0 &&
    Config.Program.substring(0, 1) != "/"
  ) {
    params.push("-w");
    params.push("/home/username/.wine/dosdevices/d:");
  } else if (
    Config.appZipFile.length > 0 &&
    Config.Program.length > 0 &&
    Config.Program.substring(0, 1) != "/"
  ) {
    var subDirectory = Config.appZipFile.substring(
      0,
      Config.appZipFile.lastIndexOf(".")
    );
    params.push("-w");
    if (isInSubDirectory(Config.appDirPrefix, subDirectory)) {
      params.push("/home/username/.wine/dosdevices/d:/" + subDirectory);
    } else {
      params.push("/home/username/.wine/dosdevices/d:");
    }
  }
  params.push("/bin/wine");
  if (Config.Program.length > 0) {
    if (Config.Program.endsWith(".bat")) {
      params.push("cmd");
      params.push("/c");
    }
    params.push(Config.Program);
  } else {
    params.push("explorer");
    params.push("/desktop=shell");
  }
  window.BoxedWineConfig.consoleLog("Emulator params:" + params);
  return params;
}

window.Module = {};
window.BoxedWineShell = (onLoad) => {
  Config = window.BoxedWineConfig;
var Module = {
  logReadFiles: Config.recordLoadedFiles, //enable if you want to prune with tools/common utility
  preRun: [initialSetup],
  arguments: [],
  postRun: onLoad ? [onLoad] : [],
  print: (function () {
    return function (text) {
      text = Array.prototype.slice.call(arguments).join(" ");
      window.BoxedWineConfig.consoleLog(text);
    };
  })(),
  printErr: function (text) {
    text = Array.prototype.slice.call(arguments).join(" ");
    if (0) {
      // XXX disabled for safety typeof dump == 'function') {
      dump(text + "\n"); // fast, straight to the real console
    } else {
      if (
        Config.recordLoadedFiles &&
        text.startsWith("FS.trackingDelegate error on read file:")
      ) {
        window.BoxedWineConfig.consoleLog(text);
        let filePath = text.substring(text.indexOf("/"));
        let prefix = "/root/base/";
        if (filePath.startsWith(prefix)) {
          recordedFiles.push(filePath);
        }
      } else {
        console.error(text);
      }
    }
  },
  canvas: (function () {
    var canvas = document.getElementById("boxedWineCanvas");

    // As a default initial behavior, pop up an alert when webgl context is lost. To make your
    // application robust, you may want to override this behavior before shipping!
    // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
    canvas.addEventListener(
      "webglcontextlost",
      function (e) {
        console.error("WebGL context lost. You will need to reload the page.");
        e.preventDefault();
      },
      false
    );
    canvas.width = 800;
    canvas.height = 600;
    return canvas;
  })(),
  setStatus: function (text) {
    if (!Module.setStatus.last)
      Module.setStatus.last = { time: Date.now(), text: "" };
  },
  totalDependencies: 0,
  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Module.setStatus(
      left
        ? "Preparing... (" +
            (this.totalDependencies - left) +
            "/" +
            this.totalDependencies +
            ")"
        : ""
    );
  },
};

window.Module = Module;
window.BoxedWine();

}

function saveFSImage() {
  window.BoxedWineConfig.consoleLog("saving filesystem files:" + recordedFiles.length);
  let prefix = "/root/base/";
  var zip = new JSZip();
  zip.file("tmp", null, { dir: true });
  recordedFiles.forEach((filePath) => {
    try {
      if (!FS.isDir(FS.stat(filePath).mode)) {
        let data = FS.readFile(filePath, { encoding: "binary" });
        zip.file(filePath.substring(prefix.length), data);
      }
    } catch (ex) {
      window.BoxedWineConfig.consoleLog("unable to read file:" + filePath + " error:" + ex);
    }
  });
  window.BoxedWineConfig.consoleLog("generating zip file");
  let zipFile = zip.generate({ type: "blob", compression: "DEFLATE" });
  window.BoxedWineConfig.consoleLog("finished generating zip file");
  url = window.URL.createObjectURL(zipFile);
  ae.href = url;
  ae.download = "boxedwine-min.zip";
  ae.click();
}
function isHomeDirectory(str) {
  if (str.length >= 10) {
    if (str.substring(0, 10) === "/root/home") {
      return true;
    }
  }
  return false;
}
function startWithFiles(files) {
  for (let i = 0; i < files.length; i++) {
    uploadFile(files[i]);
  }
}
function uploadFile(file, fullPath, allFiles) {
  let filename = null;
  if (fullPath) {
    filename = fullPath.startsWith("/") ? fullPath.substring(1) : fullPath;
  } else {
    filename =
      file.webkitRelativePath.length == 0 ? file.name : file.webkitRelativePath;
  }
  var filereader = new FileReader();
  filereader.file_name = file.name;
  filereader.onload = function () {
    readFile(this.result, filename, allFiles);
  };
  filereader.readAsArrayBuffer(file);
}
function extractLastPartOfPath(str) {
  return str.substring(str.lastIndexOf("/") + 1, str.length);
}
function extractFirstPartOfPath(str) {
  return str.substring(0, str.lastIndexOf("/"));
}
function extractFilenameExtension(str) {
  return str.substring(str.lastIndexOf(".") + 1, str.length);
}
function extractFilenameWithoutExtension(str) {
  return str.substring(0, str.lastIndexOf("."));
}
function readFile(data, name, allFiles) {
  var fileExt = extractFilenameExtension(name);
  if (fileExt.toLowerCase() === "zip") {
    var filenameNoExt = extractFilenameWithoutExtension(name);
    if (!createFolder(Config.appDirPrefix, filenameNoExt)) {
      //If dir exists and user says no to replace existing dir, then stop here
      return;
    }
    var zipDirPrefix = Config.appDirPrefix + filenameNoExt;
    var zip = new JSZip(data);
    for (var entry in zip.files) {
      var data = zip.file(entry);
      if (data != null) {
        var buf = data.asUint8Array();
        var parent = zipDirPrefix + "/" + extractFirstPartOfPath(entry);
        var filename = extractLastPartOfPath(entry);
        createFile(parent, filename, buf);
      } else {
        //directory
        var fullPath = entry.substring(0, entry.length - 1);
        var parent = extractFirstPartOfPath(fullPath);
        var dir = extractLastPartOfPath(fullPath);
        if (parent.length == 0) {
          parent = zipDirPrefix;
        } else {
          parent = zipDirPrefix + "/" + parent;
        }
        createFolder(parent, dir);
      }
    }
  } else {
    var done = false;
    var startIndex = 0;
    var base = Config.appDirPrefix;
    var filename = extractLastPartOfPath(name);
    while (!done) {
      var dirIndex = name.indexOf("/", startIndex);
      if (dirIndex == -1) {
        done = true;
      } else {
        var dirName = name.substring(startIndex, dirIndex);
        var key = base + dirName;
        if (dirName.length > 0) {
          if (uniqueDirs[key] == null && dirName.length > 0) {
            createFolder(base, dirName);
            uniqueDirs[key] = "";
          }
          base = base + dirName + "/";
        }
        startIndex = dirIndex + 1;
      }
    }
    createFile(
      base.substring(0, base.length - 1),
      filename,
      new Uint8Array(data)
    );
    if (allFiles) {
      allFiles.pop(name);
    }
  }
}
function calcBackupFilename() {
  var d = new Date();
  var str = d.toISOString();
  str = ".backup." + str.split(":").join(".");
  return str;
}
function createFolder(parent, dir) {
  var created = true;
  try {
    FS.createPath(parent, dir, true, true);
  } catch (ef) {
    if (ef.message === "File exists" || ef.message === "FS error") {
      window.BoxedWineConfig.consoleLog("Directory already exists! :" + parent + dir);
      var replace = confirm(
        "Directory already exists: " + parent + dir + " continue?"
      );
      if (replace) {
        try {
          //yeah, like that would work! FS.rmdir(parent + dir);
          FS.rename(parent + dir, parent + dir + calcBackupFilename());
          FS.createPath(parent, dir, true, true);
          window.BoxedWineConfig.consoleLog("Directory replaced: " + parent + dir);
        } catch (eef) {
          window.BoxedWineConfig.consoleLog("eef=" + eef);
          created = false;
          console.error("unable to create folder: " + parent + dir);
        }
      } else {
        created = false;
      }
    } else {
      window.BoxedWineConfig.consoleLog("ef=" + ef);
    }
  }
  return created;
}
function createFile(dir, name, buf) {
  if (dir.includes("__MACOSX")) {
    return;
  }
  try {
    FS.createDataFile(dir, name, buf, true, true);
    //window.BoxedWineConfig.consoleLog("File created :" + dir + "/" + name);
  } catch (e) {
    if (e.message === "File exists" || e.message === "FS error") {
      window.BoxedWineConfig.consoleLog("File already exists!: " + dir + name);
      var replace = confirm(
        "File already exists: " + dir + "/" + name + " replace?"
      );
      if (replace) {
        try {
          FS.unlink(dir + "/" + name);
          FS.createDataFile(dir, name, buf, true, true);
          window.BoxedWineConfig.consoleLog("File replaced: " + dir + name);
        } catch (ee) {
          window.BoxedWineConfig.consoleLog("ee=" + ee);
          console.error("unable to create file: " + dir + name);
        }
      }
    } else {
      window.BoxedWineConfig.consoleLog("e=" + e);
    }
  }
}
function toggleConsole() {}
function toggleSound() {}
function toggleDirectory(item) {}
function getParameter(inputKey) {
  var retVal = "";
  var replacementParameters = Config.urlParams;
  var url =
    replacementParameters.length > 0
      ? "?" + replacementParameters
      : window.location.href;
  var index = url.indexOf("?") + 1;
  if (index > 0) {
    var paramStr = url.substring(index);
    var params = paramStr.split("&");
    for (var x = 0; x < params.length; x++) {
      var param = params[x];
      var kv = param.split("=");
      var key = kv[0];
      if (key === inputKey) {
        retVal = kv[1];
        break;
      }
    }
  }
  var hashIndex = retVal.lastIndexOf("#");
  if (hashIndex > 0) {
    retVal = retVal.substring(0, hashIndex);
  }
  return retVal;
}
function select(index, dir, filename) {
  if (selectedItem != null) {
    selectedItem.style.backgroundColor = "";
  }

  var fullpath = dir;
  if (filename != null) {
    fullpath = fullpath + filename;
  }
  selectedFilename = filename;
}
function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
function extract() {
  if (url != null) {
    window.URL.revokeObjectURL(url);
  }
}
function done() {
  if (url != null) {
    window.URL.revokeObjectURL(url);
  }
}
function leaf(entry) {
  index++;
  var text =
    '<tr><td ><span id="' +
    index +
    '-data" onclick="select(' +
    index +
    ",'" +
    entry.dir +
    "','" +
    entry.filename +
    "')\">" +
    entry.filename +
    "</span></td></tr>";
  return text;
}
function branch(entries) {
  var item = entries[index];
  index++;
  var dir = item.dir;
  var dirName = dir.substring(0, dir.length - 1);
  dirName = dirName.substring(dirName.lastIndexOf("/") + 1, dirName.length);
  var text = "<tr>";
  text = text + "<td>";
  text =
    text +
    '<span id="' +
    index +
    '-expand"><a onclick="toggleDirectory(\'' +
    index +
    "')\"><strong>+</strong></a></span>";
  text =
    text +
    '<span id="' +
    index +
    '-contract" style="display:none;"><a onclick="toggleDirectory(\'' +
    index +
    "')\"><strong>-</strong></a></span>";
  text =
    text +
    '<span id="' +
    index +
    '-data" onclick="select(' +
    index +
    ",'" +
    dir +
    "', null)\">[" +
    dirName +
    "]</span>";
  text = text + "<div id='" + index + '\' style="display:none;">';
  text = text + "<table>";
  while (index < entries.length) {
    var nextItem = entries[index];
    if (nextItem.dir === item.dir) {
      text = text + leaf(nextItem);
    } else if (parentDir(nextItem.dir) === item.dir) {
      text = text + branch(entries, index);
    } else {
      break;
    }
  }
  text = text + "</table>";
  text = text + "</div>";
  text = text + "</td>";
  text = text + "</tr>";
  return text;
}
function parentDir(childDir) {
  if (endsWith(childDir, "/")) {
    childDir = childDir.substring(0, childDir.length - 1);
  }
  var parentDir = childDir.substring(0, childDir.lastIndexOf("/") + 1);
  return parentDir;
}
function buildTree() {
  selectedFilename = null;
  files = [];
  index = 0;

  var currentDir = Config.appDirPrefix;
  readFiles(currentDir, files);

  toggleDirectory("1");
}

function readFiles(currentDir, files) {
  window.BoxedWineConfig.consoleLog("adding directory: " + currentDir);
  files.push({ dir: currentDir, filename: "" });
  var entries = FS.readdir(currentDir).filter(function (param) {
    return param !== "." && param !== "..";
  });
  entries.forEach(function (entry) {
    var fileEntry = FS.lookupPath(currentDir + entry, { follow: true });
    if (fileEntry.node.isFolder) {
      readFiles(currentDir + entry + "/", files);
    } else {
      window.BoxedWineConfig.consoleLog("adding file: " + currentDir + entry);
      files.push({ dir: currentDir, filename: entry });
    }
  });
}

function startsWith(str, prefix) {
  return str.slice(0, prefix.length) == prefix;
}
function getFile(file, isDirectory) {
  if (isDirectory) {
    //zip up directory
    var zip = new JSZip();
    files.forEach(function (eachFile) {
      if (startsWith(eachFile.dir, file)) {
        if (eachFile.filename !== "") {
          var fileLocation = eachFile.dir + eachFile.filename;
          var data = FS.readFile(fileLocation, { encoding: "binary" });
          zip.file(fileLocation.substring(file.length), data);
        } else {
          zip.file(eachFile.dir.substring(file.length), null, { dir: true });
        }
      }
    });
    return zip.generate({ type: "blob", compression: "DEFLATE" });
  } else {
    var data = FS.readFile(file, { encoding: "binary" });
    return new Blob([data], { type: "octet/stream" });
  }
}
