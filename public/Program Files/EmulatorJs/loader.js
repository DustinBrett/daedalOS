(async function () {
  let VERSION = 23.5;
  let scriptTag = document.getElementsByTagName("script")[0];
  function loadStyle(file) {
    return new Promise(function (resolve, reject) {
      let css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = (function () {
        if (
          "undefined" != typeof EJS_paths &&
          typeof EJS_paths[file] == "string"
        ) {
          return EJS_paths[file];
        } else if ("undefined" != typeof EJS_pathtodata) {
          if (!EJS_pathtodata.endsWith("/")) EJS_pathtodata += "/";
          return EJS_pathtodata + file;
        } else {
          return file;
        }
      })();
      css.onload = resolve;
      document.head.appendChild(css);
    });
  }
  function loadScript(file) {
    return new Promise(function (resolve, reject) {
      let script = document.createElement("script");
      script.src = (function () {
        if (
          "undefined" != typeof EJS_paths &&
          typeof EJS_paths[file] == "string"
        ) {
          return EJS_paths[file];
        } else if ("undefined" != typeof EJS_pathtodata) {
          if (!EJS_pathtodata.endsWith("/")) EJS_pathtodata += "/";
          return EJS_pathtodata + file;
        } else {
          return file;
        }
      })();
      scriptTag.parentNode.insertBefore(script, scriptTag);
      script.onload = resolve;
    });
  }
  if ("undefined" != typeof EJS_DEBUG_XX && true === EJS_DEBUG_XX) {
    await loadStyle("emu-css.css");
    await loadScript("emu-main.js");
    await loadScript("emulator.js");
  } else {
    await loadStyle("emu-css.min.css");
    await loadScript("emulator.min.js");
  }
  let config = {};
  config.gameUrl = EJS_gameUrl;
  "undefined" != typeof EJS_mameCore && (config.mameCore = EJS_mameCore);
  "undefined" != typeof EJS_biosUrl && (config.biosUrl = EJS_biosUrl);
  "undefined" != typeof EJS_gameID && (config.gameId = EJS_gameID);
  "undefined" != typeof EJS_gameParentUrl &&
    (config.gameParentUrl = EJS_gameParentUrl);
  "undefined" != typeof EJS_gamePatchUrl &&
    (config.gamePatchUrl = EJS_gamePatchUrl);
  "undefined" != typeof EJS_AdUrl && (config.adUrl = EJS_AdUrl);
  "undefined" != typeof EJS_paths && (config.paths = EJS_paths);
  "undefined" != typeof EJS_netplayUrl && (config.netplayUrl = EJS_netplayUrl);
  "undefined" != typeof EJS_startOnLoaded &&
    (config.startOnLoad = EJS_startOnLoaded);
  "undefined" != typeof EJS_core && (config.system = EJS_core);
  "undefined" != typeof EJS_oldCores && (config.oldCores = EJS_oldCores);
  "undefined" != typeof EJS_loadStateURL &&
    (config.loadStateOnStart = EJS_loadStateURL);
  "undefined" != typeof EJS_language && (config.lang = EJS_language);
  "undefined" != typeof EJS_noAutoCloseAd &&
    (config.noAutoAdClose = EJS_noAutoCloseAd);
  "undefined" != typeof EJS_VirtualGamepadSettings &&
    (config.VirtualGamepadSettings = EJS_VirtualGamepadSettings);
  "undefined" != typeof EJS_oldEJSNetplayServer &&
    (config.oldNetplayServer = EJS_oldEJSNetplayServer);
  "undefined" != typeof EJS_Buttons && (config.buttons = EJS_Buttons);
  "undefined" != typeof EJS_Settings && (config.settings = EJS_Settings);
  config.onsavestate = null;
  config.onloadstate = null;
  "undefined" != typeof EJS_onSaveState &&
    (config.onsavestate = EJS_onSaveState);
  "undefined" != typeof EJS_onLoadState &&
    (config.onloadstate = EJS_onLoadState);
  "undefined" != typeof EJS_lightgun && (config.lightgun = EJS_lightgun);
  "undefined" != typeof EJS_gameName && (config.gameName = EJS_gameName);
  "undefined" != typeof EJS_pathtodata && (config.dataPath = EJS_pathtodata);
  "undefined" != typeof EJS_mouse && (config.mouse = EJS_mouse);
  "undefined" != typeof EJS_multitap && (config.multitap = EJS_multitap);
  "undefined" != typeof EJS_playerName && (config.playerName = EJS_playerName);
  "undefined" != typeof EJS_cheats && (config.cheats = EJS_cheats);
  "undefined" != typeof EJS_color && (config.color = EJS_color);
  window.EJS_emulator = await new EJS(EJS_player, config);
  "undefined" != typeof EJS_onGameStart &&
    EJS_emulator.on("start-game", EJS_onGameStart);
})();
