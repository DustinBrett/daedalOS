window.DXBall = {
  basePath: "/Program Files/DX-Ball",
  calcRecords: ({ name, score }) => window.DXBall.saveRecords?.(name, score),
  intervals: [],
  timeouts: [],
  audioFiles: {},
  audioTracks: [],
  status: "idle",
  close: () => {
    window.DXBall.intervals.forEach(clearInterval);
    window.DXBall.timeouts.forEach(clearTimeout);

    Object.values((window.DXBall.audioFiles || {})).forEach((track) => track.pause());
    (window.DXBall.audioTracks || []).forEach((track) => track.pause());

    window.DXBall.audioFiles = {};
    window.DXBall.audioTracks = [];
    window.DXBall.intervals = [];
    window.DXBall.timeouts = [];

    window.DXBall.status = "idle";
  },
  init: (loadedFunction, saveFunction) => {
    window.DXBall.status = "running";
    window.DXBall.saveRecords = saveFunction;
    var mbbkgrnd_img = new Image();
    mbbkgrnd_img["src"] = window.DXBall.basePath + "/images/mbbkgrnd.png";
    var sphere_img = new Image();
    sphere_img["src"] = window.DXBall.basePath + "/images/sphere.png";
    var Highscor_img = new Image();
    Highscor_img["src"] = window.DXBall.basePath + "/images/Highscor.png";
    var Mainmenu_img = new Image();
    Mainmenu_img["src"] = window.DXBall.basePath + "/images/Mainmenu.png";
    var Intro_img = new Image();
    Intro_img["src"] = window.DXBall.basePath + "/images/Intro.png";
    var bigbolt_img = new Image();
    for (
      bigbolt_img["src"] = window.DXBall.basePath + "/images/bigbolt.png",
        audioName = [
          "Ethno_pa.mp3",
          "Acker-gs.mp3",
          "12flight.mp3",
          "Brain.mp3",
          "Freebee.mp3",
          "Gmfigaro.mp3",
          "Ao-laser",
          "Bang",
          "Bassdrum",
          "Boing",
          "Byeball",
          "Effect",
          "Effect2",
          "Fanfare",
          "Glass",
          "Gunfire",
          "Humm",
          "Orchblas",
          "Orchestr",
          "Padexplo",
          "Peow!",
          "Ricochet",
          "Saucer",
          "Sweepdow",
          "Swordswi",
          "Tank",
          "Thudclap",
          "Voltage",
          "Whine",
          "Wowpulse",
          "Xploshor",
          "Xplosht1",
        ],
        i = 0;
      i < audioName["length"];
      i++
    ) {
      (window.DXBall.audioFiles[audioName[i]] = document["createElement"]("audio")),
        "3" == audioName[i][audioName[i]["length"] - 1]
          ? ((source = document["createElement"]("source")),
            source["setAttribute"]("src", window.DXBall.basePath + "/audio/sound/" + audioName[i]),
            window.DXBall.audioFiles[audioName[i]]["appendChild"](source))
          : ((source = document["createElement"]("source")),
            source["setAttribute"](
              "src",
              window.DXBall.basePath + "/audio/sfx/wav/" + audioName[i] + ".wav"
            ),
            window.DXBall.audioFiles[audioName[i]]["appendChild"](source),
            (source = document["createElement"]("source")),
            source["setAttribute"](
              "src",
              window.DXBall.basePath + "/audio/sfx/mp3/" + audioName[i] + ".mp3"
            ),
            window.DXBall.audioFiles[audioName[i]]["appendChild"](source),
            (source = document["createElement"]("source")),
            source["setAttribute"](
              "src",
              window.DXBall.basePath + "/audio/sfx/aac/" + audioName[i] + ".aac"
            ),
            window.DXBall.audioFiles[audioName[i]]["appendChild"](source)),
        window.DXBall.audioFiles[audioName[i]]["load"]();
    }

    function dx_ball(_0x56c3x8, _0x56c3x9) {
      (window["soundon"] = _0x56c3x8),
        (window["saveron"] = _0x56c3x9),
        (myFonts = new (function () {
          (this["font"] = []),
            (this["getFont"] = function (
              _0x56c3x8,
              _0x56c3x9,
              _0x56c3xa,
              _0x56c3xb
            ) {
              for (
                this["font"][_0x56c3x8] = {},
                  this["font"][_0x56c3x8]["space"] = _0x56c3xb,
                  this["fontFile"] = _0x56c3x9,
                  this["sb"] = 16,
                  this["font"][_0x56c3x8]["chars"] = this["fontFile"][0],
                  this["font"][_0x56c3x8]["char"] = new Array(),
                  c = 0;
                c < this["font"][_0x56c3x8]["chars"];
                c++
              ) {
                if (
                  ((this["width"] = this["fontFile"][this["sb"] - 12]),
                  (this["height"] = this["fontFile"][this["sb"] - 8]),
                  1 == this["fontFile"][this["sb"] - 11] &&
                    (this["width"] += 256),
                  0 == c && (this["maxHeight"] = this["height"]),
                  (this["sy"] = this["maxHeight"] - this["height"]),
                  (this["x"] = 0),
                  (this["y"] = this["height"]),
                  0 != this["fontFile"][this["sb"] - 4])
                ) {
                  this["char"] = String["fromCharCode"](
                    this["fontFile"][this["sb"] - 4]
                  );
                } else {
                  if (
                    ((this["char"] = c), "Mball2.sbk" == _0x56c3x8 && 8 == c)
                  ) {
                    for (
                      this["char"] = c + animframe,
                        temp = color[224],
                        _0x56c3xc = 224;
                      _0x56c3xc < 231;
                      _0x56c3xc++
                    ) {
                      color[_0x56c3xc] = color[_0x56c3xc + 1];
                    }
                    (color[231] = temp),
                      (animframe += 0.1),
                      animframe < 0.8 && c--;
                  }
                }
                for (
                  this["fontFile"][this["sb"] - 3] < 128
                    ? (descender = -this["fontFile"][this["sb"] - 3])
                    : (descender = 256 - this["fontFile"][this["sb"] - 3]),
                    this["font"][_0x56c3x8]["char"][this["char"]] =
                      new Object(),
                    this["font"][_0x56c3x8]["char"][this["char"]]["width"] =
                      this["width"],
                    this["font"][_0x56c3x8]["char"][this["char"]]["height"] =
                      this["height"],
                    this["font"][_0x56c3x8]["char"][this["char"]]["y"] =
                      this["sy"] + descender,
                    ctx["clearRect"](0, 0, 300, 300),
                    canvas["height"] = this["height"] + 1,
                    canvas["width"] = this["width"] + 1,
                    _0x56c3xc = this["sb"] + 1;
                  _0x56c3xc <= this["width"] * this["height"] + this["sb"];
                  _0x56c3xc++
                ) {
                  (ctx["fillStyle"] =
                    color[this["fontFile"][_0x56c3xc] + 256 * _0x56c3xa]),
                    0 == this["fontFile"][_0x56c3xc] &&
                      (ctx["fillStyle"] = "rgba(0,0,0,0)"),
                    ctx["fillRect"](this["x"], this["y"], 1, 1),
                    this["x"]++,
                    this["x"] >= this["width"] &&
                      ((this["x"] = 0), this["y"]--);
                }
                (animframe < 0.1 || animframe > 0.8) &&
                  (this["sb"] += this["width"] * this["height"] + 13),
                  (this["font"][_0x56c3x8]["char"][this["char"]]["img"] =
                    new Image()),
                  (this["font"][_0x56c3x8]["char"][this["char"]]["img"]["src"] =
                    canvas["toDataURL"]("image/png"));
              }
              (canvas["height"] = 1),
                (canvas["width"] = this["font"][_0x56c3x8]["space"]),
                (this["font"][_0x56c3x8]["char"][" "] = new Object()),
                (this["font"][_0x56c3x8]["char"][" "]["width"] =
                  this["font"][_0x56c3x8]["space"]),
                (this["font"][_0x56c3x8]["char"][" "]["height"] = 1),
                (this["font"][_0x56c3x8]["char"][" "]["img"] = new Image()),
                (this["font"][_0x56c3x8]["char"][" "]["img"]["src"] =
                  canvas["toDataURL"]("image/png"));
            }),
            (this["strokeText"] = function (
              _0x56c3x8,
              _0x56c3x9,
              _0x56c3xa,
              _0x56c3xb
            ) {
              for (
                _0x56c3x8 += "", curX = _0x56c3xa, _0x56c3xc = 0;
                _0x56c3xc < _0x56c3x8["length"];
                _0x56c3xc++
              ) {
                if (!this["font"]?.[_0x56c3x9]?.["char"]?.[_0x56c3x8[_0x56c3xc]]) return;
                ctx["drawImage"](
                  this["font"][_0x56c3x9]["char"][_0x56c3x8[_0x56c3xc]]["img"],
                  curX,
                  _0x56c3xb +
                    this["font"][_0x56c3x9]["char"][_0x56c3x8[_0x56c3xc]]["y"] -
                    1
                ),
                  (curX +=
                    this["font"][_0x56c3x9]["char"][_0x56c3x8[_0x56c3xc]][
                      "width"
                    ]),
                  (curX += 1);
              }
            }),
            (this["fillImg"] = function (
              _0x56c3xc,
              _0x56c3x8,
              _0x56c3x9,
              _0x56c3xa
            ) {
              if (!this["font"][_0x56c3x8]) return;
              ctx["drawImage"](
                this["font"][_0x56c3x8]["char"][_0x56c3xc]["img"],
                _0x56c3x9,
                _0x56c3xa - 1
              );
            });
        })()),
        (font = []),
        (animframe = 0),
        (color = [
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#FFFFFF",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#FFFFFF",
          "#EBEBEB",
          "#DBDBDB",
          "#CBCBCB",
          "#BBBBBB",
          "#A7A7A7",
          "#979797",
          "#878787",
          "#777777",
          "#636363",
          "#535353",
          "#434343",
          "#333333",
          "#1F1F1F",
          "#0F0F0F",
          "#000000",
          "#DBDBDB",
          "#CFCFD3",
          "#C3C3CB",
          "#B7B7C3",
          "#AFAFBB",
          "#A3A3B7",
          "#9B9BAF",
          "#8F8FA7",
          "#87879F",
          "#7F7F97",
          "#777793",
          "#6B6B8B",
          "#636383",
          "#5B5B7B",
          "#535373",
          "#4F4F6F",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#001343",
          "#001B4F",
          "#0B235B",
          "#132F6B",
          "#1F3F77",
          "#2B4B87",
          "#3B5B93",
          "#4B6F9F",
          "#5B7FAF",
          "#6F8FBB",
          "#87A3C7",
          "#9FB7D7",
          "#B7CBE3",
          "#D3E3F3",
          "#1FCFFF",
          "#17AFF3",
          "#0F93EB",
          "#0B77E3",
          "#0057DB",
          "#003FD3",
          "#0B6BE7",
          "#1F9FFF",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#FF0000",
          "#E30000",
          "#CB0000",
          "#B30000",
          "#9B0000",
          "#830000",
          "#B30000",
          "#E30000",
          "#FFFF00",
          "#F3E700",
          "#EBD700",
          "#DFC300",
          "#D7B300",
          "#CFA300",
          "#E7CF00",
          "#FFFF00",
          "#CFCFCF",
          "#B7B7B7",
          "#A3A3A3",
          "#8F8F8F",
          "#7B7B7B",
          "#676767",
          "#8F8F8F",
          "#B7B7B7",
          "#838383",
          "#6F6F6F",
          "#5F5F5F",
          "#4F4F4F",
          "#3F3F3F",
          "#2F2F2F",
          "#4F4F4F",
          "#6F6F6F",
          "#5F5F5F",
          "#4B4B4B",
          "#373737",
          "#232323",
          "#131313",
          "#000000",
          "#232323",
          "#4B4B4B",
          "#FF7F9B",
          "#E76B87",
          "#CF5773",
          "#B74763",
          "#9F3753",
          "#872B47",
          "#B74763",
          "#E76B87",
          "#0000FF",
          "#0000DF",
          "#0000C3",
          "#0000A3",
          "#000087",
          "#00006B",
          "#0000A3",
          "#0000DF",
          "#00FF00",
          "#00DF00",
          "#00BF00",
          "#00A300",
          "#008300",
          "#006700",
          "#00A300",
          "#00DF00",
          "#00B793",
          "#00A38B",
          "#00937F",
          "#008377",
          "#00736B",
          "#00635F",
          "#008377",
          "#00A38B",
          "#8300BB",
          "#6F00A7",
          "#5B0093",
          "#47007F",
          "#37006B",
          "#2B0057",
          "#47007F",
          "#6F00A7",
          "#FF8B00",
          "#EF7B00",
          "#E36B00",
          "#D35B00",
          "#C74F00",
          "#BB4300",
          "#D35B00",
          "#EF7B00",
          "#E7B300",
          "#D79F00",
          "#C78F00",
          "#B77F00",
          "#A76F00",
          "#976300",
          "#BF8700",
          "#E7B300",
          "#FF0057",
          "#EF0057",
          "#DF0057",
          "#CF0057",
          "#BF0053",
          "#AF0053",
          "#CF0057",
          "#EF0057",
          "#FF00FF",
          "#E300E3",
          "#CB00CB",
          "#AF00AF",
          "#970097",
          "#7F007F",
          "#AF00AF",
          "#E300E3",
          "#00FFFF",
          "#00E3E3",
          "#00CBCB",
          "#00AFAF",
          "#009797",
          "#007F7F",
          "#00AFAF",
          "#00E3E3",
          "#FF83DB",
          "#E773C3",
          "#D363AB",
          "#BB5797",
          "#A74B83",
          "#933F6F",
          "#BB5797",
          "#E773C3",
          "#EBD3BB",
          "#E7E7E7",
          "#F3B377",
          "#FF7F00",
          "#FF7F00",
          "#F7932F",
          "#F3AB5F",
          "#EFBF8F",
          "#008B00",
          "#007B00",
          "#006B00",
          "#005B00",
          "#004B00",
          "#003F00",
          "#006300",
          "#008B00",
          "#E3E300",
          "#A7CF00",
          "#73BF00",
          "#47AB00",
          "#239B00",
          "#008700",
          "#00770F",
          "#006723",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#FFFFFF",
          "#000000",
          "#960000",
          "#008100",
          "#818100",
          "#000084",
          "#960084",
          "#008181",
          "#C1C1C1",
          "#B5DDC0",
          "#D7D1C9",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#BF00D8",
          "#AD00C8",
          "#9A00B8",
          "#8700A8",
          "#740097",
          "#610087",
          "#4D0076",
          "#390065",
          "#240054",
          "#0F0042",
          "#0F0031",
          "#00001E",
          "#CD00FF",
          "#001E30",
          "#000B0B",
          "#000000",
          "#FED407",
          "#FF9402",
          "#FF7411",
          "#DF5200",
          "#BC4104",
          "#AB3000",
          "#861E00",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#0000A5",
          "#0000A5",
          "#00007D",
          "#000075",
          "#00006C",
          "#000066",
          "#000062",
          "#00005B",
          "#000057",
          "#000053",
          "#00004E",
          "#00004C",
          "#000048",
          "#000044",
          "#000041",
          "#00003D",
          "#00003B",
          "#000036",
          "#000034",
          "#000032",
          "#00002D",
          "#00002B",
          "#000029",
          "#000024",
          "#000022",
          "#00001F",
          "#00001D",
          "#00001B",
          "#000016",
          "#000014",
          "#000011",
          "#00000F",
          "#00000D",
          "#00000A",
          "#000008",
          "#000006",
          "#000005",
          "#000003",
          "#000003",
          "#000002",
          "#000001",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#020000",
          "#070000",
          "#100000",
          "#200000",
          "#2B0000",
          "#3A0000",
          "#4E0000",
          "#620000",
          "#BC0000",
          "#BC0000",
          "#000000",
          "#00FFF3",
          "#00FFF3",
          "#00FFF7",
          "#00FFF7",
          "#00FFFB",
          "#00FFFB",
          "#00FFFF",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#00DDF1",
          "#FFFFFF",
          "#000000",
          "#FFFFFF",
          "#F3F3F3",
          "#E4E4E4",
          "#D8D8D8",
          "#CCCCCC",
          "#C0C0C0",
          "#B4B4B4",
          "#A9A9A9",
          "#9C9C9C",
          "#909090",
          "#848484",
          "#787878",
          "#6B6B6B",
          "#5F5F5F",
          "#525252",
          "#454545",
          "#00227A",
          "#002B86",
          "#003497",
          "#003DA3",
          "#0045B3",
          "#0052BF",
          "#005FCF",
          "#00A0FF",
          "#00FF00",
          "#00EC00",
          "#00D800",
          "#00C800",
          "#00B400",
          "#00A500",
          "#000000",
          "#000000",
          "#D43400",
          "#E23D00",
          "#EF4500",
          "#FC4E00",
          "#FF5B00",
          "#FF6300",
          "#FF7000",
          "#FFA400",
          "#FFFF00",
          "#FFEC00",
          "#FFD800",
          "#FFC800",
          "#FFB400",
          "#FFA400",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#FFFBF0",
          "#006EA8",
          "#818181",
          "#FF0000",
          "#00FF00",
          "#FFFF00",
          "#0000FF",
          "#FF00FF",
          "#00FFFF",
          "#FFFFFF",
        ]),
        (FontList = [
          ["Mball2.sbk", 0, 1],
          ["Mainmenu.sbk", 0, 1],
          ["Chisel2.sbk", 1, 1],
          ["Sysfont.sbk", 0, 5],
          ["Thefont.sbk", 0, 14],
          ["Candy.sbk", 1, 6],
          ["Sfont.sbk", 0, 1],
        ]),
        (lFile = 0),
        (window["canvas"] = document["getElementById"]("dx-ball")),
        (window["canvas"]["width"] = 2e3),
        (window["canvas"]["height"] = 2e3),
        (window["ctx"] = canvas["getContext"]("2d")),
        (function _0x56c3xc() {
          var _0x56c3x8 = new XMLHttpRequest();
          _0x56c3x8["open"]("GET", window.DXBall.basePath + "/" + FontList[lFile][0], !0),
            (_0x56c3x8["responseType"] = "arraybuffer"),
            (_0x56c3x8["onload"] = function (_0x56c3x8) {
              var _0x56c3x9;
              (file = new Uint8Array(this["response"])),
                myFonts["getFont"](
                  FontList[lFile][0],
                  file,
                  FontList[lFile][1],
                  FontList[lFile][2]
                ),
                lFile++,
                lFile < FontList["length"]
                  ? _0x56c3xc()
                  : (((_0x56c3x9 = document["getElementById"]("dx-ball"))[
                      "width"
                    ] = 640),
                    (_0x56c3x9["height"] = 480),
                    _0x56c3x9["getContext"]("2d"),
                    game());
            }),
            _0x56c3x8["send"]();
        })();
    }
    game = function () {
      loadedFunction();

      var _0x56c3xa,
        _0x56c3xd = 1,
        _0x56c3xe = 1,
        _0x56c3xf = 0,
        _0x56c3x10 = 0,
        _0x56c3x11 = 0,
        _0x56c3x12 = window.DXBall.audioTracks[window.DXBall.audioTracks.push(window.DXBall.audioFiles[audioName[_0x56c3x11]]["cloneNode"](!0)) - 1];

      function _0x56c3x13(_0x56c3xc) {
        var _0x56c3x8 = null;
        try {
          _0x56c3x8 = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (_0x56c3xc) {
          try {
            _0x56c3x8 = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (_0x56c3xc) {
            try {
              _0x56c3x8 = new XMLHttpRequest();
            } catch (_0x56c3xc) {}
          }
        }
        if (null == _0x56c3x8) {
          throw new Error("XMLHttpRequest not supported");
        }
        return (
          _0x56c3x8["open"]("GET", _0x56c3xc, !1),
          _0x56c3x8["send"](null),
          _0x56c3x8["responseText"]
        );
      }

      function _0x56c3x14(_0x56c3xc) {
        soundon &&
          ((audio[naudio] = window.DXBall.audioTracks[window.DXBall.audioTracks.push(window.DXBall.audioFiles[_0x56c3xc]["cloneNode"](!0)) - 1]),
          audio[naudio]["play"](),
          naudio++,
          64 <= naudio && (naudio = 0));
      }

      function _0x56c3x15(_0x56c3x8) {
        for (
          myFonts["strokeText"](_0x56c3x8, "Thefont.sbk", 30, 1), i = 1;
          i < user["lives"];
          i++
        ) {
          myFonts["fillImg"](30, "Mball2.sbk", 620 - 22 * i, 2);
        }
      }

      function _0x56c3x16() {
        (this["x"] = 320),
          (this["y"] = 440),
          (this["is"] = !0),
          (this["anim"] = 0),
          (this["xSpeed"] = 0),
          (this["ySpeed"] = 0),
          (this["magnet"] = 0),
          (this["draw"] = function () {
            shadow["drawing"] ||
              (bonus["fireball"]
                ? myFonts["fillImg"](
                    60,
                    "Mball2.sbk",
                    parseInt(this["x"] - 4),
                    parseInt(this["y"] - 4)
                  )
                : bonus["shball"]
                ? myFonts["fillImg"](
                    54,
                    "Mball2.sbk",
                    parseInt(this["x"] - 2),
                    parseInt(this["y"] - 2)
                  )
                : myFonts["fillImg"](
                    0,
                    "Mball2.sbk",
                    parseInt(this["x"] - 4),
                    parseInt(this["y"] - 4)
                  ));
          }),
          (this["move"] = function () {
            if (
              (Math["sqrt"](
                Math["pow"](this["xSpeed"], 2) + Math["pow"](this["xSpeed"], 2)
              ),
              (this["x"] += 6 * this["xSpeed"] * _0x56c3xe),
              (this["y"] += 6 * this["ySpeed"] * _0x56c3xe),
              this["y"] > 476 && ((this["is"] = !1), _0x56c3x1e(!1)),
              this["y"] < 4 &&
                ((this["y"] = 4),
                (this["ySpeed"] *= -1),
                _0x56c3x14("Bassdrum")),
              this["x"] > 615 &&
                ((this["x"] = 615),
                (this["xSpeed"] *= -1),
                _0x56c3x14("Bassdrum")),
              this["x"] < 23 &&
                ((this["x"] = 23),
                (this["xSpeed"] *= -1),
                _0x56c3x14("Bassdrum")),
              bonus["fireball"] &&
                0 == parseInt(6 * Math["random"]()) &&
                !this["magnet"] &&
                ((flash[nflash] = new _0x56c3x19(
                  this["x"],
                  this["y"],
                  this["xSpeed"] / -12,
                  this["ySpeed"] / -12,
                  24,
                  6,
                  "255,0,0"
                )),
                nflash++,
                nflash >= 128 && (nflash = 0)),
              this["y"] > 45 &&
                this["y"] < 350 &&
                this["x"] > 20 &&
                this["x"] < 620)
            ) {
              for (
                y = parseInt((this["y"] - 45) / 15) - 1;
                y < parseInt((this["y"] - 45) / 15) + 1;
                y++
              ) {
                for (
                  x = parseInt((this["x"] - 20) / 30) - 1;
                  x < parseInt((this["x"] - 20) / 30) + 1;
                  x++
                ) {
                  0 != bricks[x][y]["type"] &&
                    this["x"] > bricks[x][y]["x"] - 5 &&
                    this["x"] < bricks[x][y]["x"] + 35 &&
                    this["y"] > bricks[x][y]["y"] - 5 &&
                    this["y"] < bricks[x][y]["y"] + 20 &&
                    (bonus["fireball"] &&
                      ((bricks[x][y]["type"] = 8),
                      (i = bang["length"]),
                      (bang[i] = new _0x56c3x1a(this["x"], this["y"]))),
                    bricks[x][y]["dell"](x, y),
                    (this["x"] - (bricks[x][y]["x"] - 5) <
                      this["y"] - (bricks[x][y]["y"] - 5) &&
                      this["x"] - (bricks[x][y]["x"] - 5) <
                        bricks[x][y]["y"] + 20 - this["y"]) ||
                    (bricks[x][y]["x"] + 35 - this["x"] <
                      this["y"] - (bricks[x][y]["y"] - 5) &&
                      bricks[x][y]["x"] + 35 - this["x"] <
                        bricks[x][y]["y"] + 20 - this["y"])
                      ? ((bonus["thru"] &&
                          2 != bricks[x][y]["type"] &&
                          21 != bricks[x][y]["type"]) ||
                          (this["xSpeed"] *= -1),
                        this["x"] < bricks[x][y]["x"] + 15
                          ? (this["x"] = bricks[x][y]["x"] - 5)
                          : (this["x"] = bricks[x][y]["x"] + 35))
                      : ((bonus["thru"] &&
                          2 != bricks[x][y]["type"] &&
                          21 != bricks[x][y]["type"]) ||
                          (this["ySpeed"] *= -1),
                        this["y"] < bricks[x][y]["y"] + 7
                          ? (this["y"] = bricks[x][y]["y"] - 5)
                          : (this["y"] = bricks[x][y]["y"] + 20)));
                }
              }
            }
            this["y"] >= 445 &&
              this["x"] < paddle["x"] + paddle["width"] &&
              this["x"] > paddle["x"] &&
              (bonus["falling"](),
              1 == bonus["magnet"]
                ? ((this["magnet"] = this["x"] - paddle["x"]),
                  _0x56c3x14("Humm"))
                : _0x56c3x14("Boing"),
              (this["ySpeed"] *= -1),
              (this["xSpeed"] =
                (this["x"] - (paddle["x"] + parseInt(paddle["width"] / 2))) /
                30),
              (this["y"] = 445)),
              this["magnet"] &&
                ((this["ySpeed"] = -1),
                (this["xSpeed"] =
                  (this["x"] - (paddle["x"] + parseInt(paddle["width"] / 2))) /
                  30),
                (this["x"] = paddle["x"] + this["magnet"]),
                (this["y"] = 445)),
              this["anim"] < 3 ? (this["anim"] += 0.2) : (this["anim"] = 0),
              this["draw"]();
          });
      }

      function _0x56c3x17(_0x56c3x9, _0x56c3xa) {
        (this["aframe"] = 0),
          (this["x"] = 30 * _0x56c3x9 + 20),
          (this["y"] = 15 * _0x56c3xa + 50),
          (this["type"] = 0),
          (this["imgId"] = [
            1, 2, 3, 4, 5, 6, 7, 1, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 55,
            56, 57, 58, 59, 8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 21, 22, 23,
            24, 25, 26, 27, 28,
          ]),
          (this["draw"] = function () {
            this["aframe"]
              ? (_0x56c3x8 = this["aframe"])
              : (_0x56c3x8 = this["type"]),
              7 == this["type"] && (_0x56c3x8 = 0),
              this["x"] > 19 &&
                this["x"] < 620 &&
                1 != this["imgId"][parseInt(_0x56c3x8)] &&
                myFonts["fillImg"](
                  this["imgId"][parseInt(_0x56c3x8)],
                  "Mball2.sbk",
                  this["x"],
                  this["y"]
                );
          }),
          (this["bang"] = function (_0x56c3xc, _0x56c3x8) {
            0 != this["type"] && (this["aframe"] = 30),
              8 == this["type"] &&
                (this["timeout"] = window.DXBall.timeouts.push(setTimeout(function () {
                  0 == parseInt(1 * Math["random"]())
                    ? _0x56c3x14("Xploshor")
                    : _0x56c3x14("Xploshor1"),
                    bricks[_0x56c3xc - 1][_0x56c3x8 - 1]["bang"](
                      _0x56c3xc - 1,
                      _0x56c3x8 - 1
                    ),
                    bricks[_0x56c3xc][_0x56c3x8 - 1]["bang"](
                      _0x56c3xc,
                      _0x56c3x8 - 1
                    ),
                    bricks[_0x56c3xc + 1][_0x56c3x8 - 1]["bang"](
                      _0x56c3xc + 1,
                      _0x56c3x8 - 1
                    ),
                    bricks[_0x56c3xc - 1][_0x56c3x8]["bang"](
                      _0x56c3xc - 1,
                      _0x56c3x8
                    ),
                    bricks[_0x56c3xc + 1][_0x56c3x8]["bang"](
                      _0x56c3xc + 1,
                      _0x56c3x8
                    ),
                    bricks[_0x56c3xc - 1][_0x56c3x8 + 1]["bang"](
                      _0x56c3xc - 1,
                      _0x56c3x8 + 1
                    ),
                    bricks[_0x56c3xc][_0x56c3x8 + 1]["bang"](
                      _0x56c3xc,
                      _0x56c3x8 + 1
                    ),
                    bricks[_0x56c3xc + 1][_0x56c3x8 + 1]["bang"](
                      _0x56c3xc + 1,
                      _0x56c3x8 + 1
                    );
                }, 80))),
              0 != this["type"] &&
                2 != this["type"] &&
                ((user["score"] += 10), _0x56c3xd--),
              (this["type"] = 0);
          }),
          (this["dell"] = function (_0x56c3x8, _0x56c3x9) {
            switch (this["type"]) {
              case 2:
                _0x56c3x14("Ao-laser"), (this["type"] = 2);
                break;
              case 3:
                _0x56c3x14("Effect"), (this["type"] = 4), (user["score"] += 10);
                break;
              case 4:
                _0x56c3x14("Effect"), (this["type"] = 5), (user["score"] += 10);
                break;
              case 5:
                _0x56c3x14("Effect"),
                  (this["type"] = 0),
                  _0x56c3xd--,
                  (user["score"] += 10);
                break;
              case 6:
                for (_0x56c3x14("Glass"), i = 0; i < 6; i++) {
                  (flash[nflash] = new _0x56c3x19(
                    this["x"],
                    this["y"],
                    8 * Math["random"]() - 4,
                    6 * Math["random"](),
                    24,
                    10,
                    "255,255,255"
                  )),
                    nflash++,
                    nflash >= 128 && (nflash = 0);
                }
                (this["type"] = 0), _0x56c3xd--, (user["score"] += 10);
                break;
              case 7:
                for (_0x56c3x14("Glass"), i = 0; i < 6; i++) {
                  (flash[nflash] = new _0x56c3x19(
                    this["x"],
                    this["y"],
                    8 * Math["random"]() - 4,
                    6 * Math["random"](),
                    24,
                    10,
                    "255,255,255"
                  )),
                    nflash++,
                    nflash >= 128 && (nflash = 0);
                }
                (this["type"] = 6), (user["score"] += 10);
                break;
              case 8:
                this["bang"](_0x56c3x8, _0x56c3x9);
                break;
              case 21:
                _0x56c3x14("Effect"),
                  (this["type"] = 2),
                  _0x56c3xd--,
                  (user["score"] += 10);
                break;
              default:
                _0x56c3x14("Wowpulse"),
                  (this["type"] = 0),
                  _0x56c3xd--,
                  (user["score"] += 10);
            }
            7 != this["type"] &&
              2 != this["type"] &&
              0 == parseInt(8 * Math["random"]()) &&
              bonus["init"](this["x"], this["y"]);
          }),
          (this["move"] = function () {
            this["draw"](),
              this["aframe"] &&
                (this["aframe"] >= 30 && this["aframe"]++,
                this["aframe"] > 36 && (this["aframe"] = 0),
                8 == this["type"] &&
                  (this["aframe"] >= 23 &&
                    this["aframe"] < 30 &&
                    (this["aframe"] += 0.3),
                  this["aframe"] > 30 &&
                    ((this["aframe"] = 23), this["draw"]())));
          });
      }

      function _0x56c3x18() {
        (this["x"] = 0),
          (this["y"] = 435),
          (this["is"] = !0),
          (this["ySpeed"] = -10),
          (this["draw"] = function () {
            myFonts["fillImg"](31, "Mball2.sbk", this["x"], this["y"]);
          }),
          (this["move"] = function () {
            if (this["is"]) {
              if (
                this["y"] > 45 &&
                this["y"] < 345 &&
                this["x"] > 20 &&
                this["x"] < 620
              ) {
                for (
                  y = parseInt((this["y"] - 45) / 15) - 1;
                  y < parseInt((this["y"] - 45) / 15) + 1;
                  y++
                ) {
                  for (
                    x = parseInt((this["x"] - 20) / 30) - 1;
                    x < parseInt((this["x"] - 20) / 30) + 1;
                    x++
                  ) {
                    0 != bricks[x][y]["type"] &&
                      this["x"] > bricks[x][y]["x"] - 5 &&
                      this["x"] < bricks[x][y]["x"] + 35 &&
                      this["y"] > bricks[x][y]["y"] - 5 &&
                      this["y"] < bricks[x][y]["y"] + 20 &&
                      (bricks[x][y]["dell"](x, y), (this["is"] = !1));
                  }
                }
              }
              (this["y"] += this["ySpeed"]), this["is"] && this["draw"]();
            }
          });
      }

      function _0x56c3x19(
        _0x56c3xc,
        _0x56c3x8,
        _0x56c3x9,
        _0x56c3xa,
        _0x56c3xb,
        _0x56c3xd,
        _0x56c3xe
      ) {
        (this["x"] =
          _0x56c3xc +
          (-_0x56c3xd / 2 + parseInt(Math["random"]() * _0x56c3xd))),
          (this["y"] =
            _0x56c3x8 +
            (-_0x56c3xd / 2 + parseInt(Math["random"]() * _0x56c3xd))),
          (this["xSpeed"] = _0x56c3x9),
          (this["ySpeed"] = _0x56c3xa),
          (this["live"] = _0x56c3xb),
          (_0x56c3xe = _0x56c3xe),
          (this["is"] = !0),
          (this["draw"] = function () {
            (ctx["fillStyle"] =
              "rgba(" + _0x56c3xe + "," + this["live"] / 24 + ")"),
              ctx["fillRect"](parseInt(this["x"]), parseInt(this["y"]), 2, 2);
          }),
          (this["move"] = function () {
            this["is"] &&
              (this["live"]--,
              this["live"] <= 0 && (this["is"] = !1),
              (this["x"] += this["xSpeed"]),
              (this["y"] += this["ySpeed"]),
              this["draw"]());
          });
      }

      function _0x56c3x1a(_0x56c3x8, _0x56c3x9) {
        for (
          this["x"] = _0x56c3x8,
            this["y"] = _0x56c3x9,
            this["aframe"] = 0,
            this["is"] = !0,
            i = 0;
          i < 8;
          i++
        ) {
          (flash[nflash] = new _0x56c3x19(
            this["x"],
            this["y"],
            8 * Math["random"]() - 4,
            8 * Math["random"]() - 4,
            24,
            10,
            "255,255,255"
          )),
            nflash++,
            nflash >= 128 && (nflash = 0);
        }
        (this["draw"] = function () {
          myFonts["fillImg"](
            143 + this["aframe"],
            "Mball2.sbk",
            this["x"] - 21,
            this["y"] - 21
          );
        }),
          (this["move"] = function () {
            this["is"] &&
              (this["aframe"] < 22 ? this["aframe"]++ : (this["is"] = !1),
              this["draw"]());
          });
      }
      for (
        window["cl"] = !1,
          user = new Object(),
          user["name"] = "",
          user["startTime"] = 0,
          paused = paus = !1,
          window["soundon"] &&
            ((window.DXBall.audioFiles["Whine"]["loop"] = "loop"),
            (window.DXBall.audioFiles["Voltage"]["loop"] = "loop"),
            window.DXBall.audioFiles["Whine"]["play"]()),
          naudio = 0,
          nflash = 0,
          audio = new Array(),
          balls = new Array(),
          bricks = new Array(),
          bullets = new Array(),
          bang = new Array(),
          flash = new Array(),
          records = new Array(),
          file = _0x56c3x13(window.DXBall.basePath + "/default.bds"),
          lightning = new (function () {
            (this["drawing"] = !1),
              (this["x"] = this["y"] = 0),
              (this["volume"] = 0),
              (this["is"] = !1),
              (this["timout"] = !1),
              (this["set"] = function (_0x56c3xc, _0x56c3x8) {
                (this["x"] = _0x56c3xc),
                  (this["y"] = _0x56c3x8),
                  (this["is"] = !0),
                  (this["timout"] = window.DXBall.timeouts.push(setTimeout(function () {
                    lightning["show"]();
                  }, 3e4))),
                  (this["volume"] = 0),
                  window.DXBall.audioFiles["Voltage"]["play"]();
              }),
              (this["show"] = function () {
                (bricks[this["x"]][this["y"]]["type"] = 8),
                  bricks[this["x"]][this["y"]]["bang"](this["x"], this["y"]),
                  _0x56c3x14("Thudclap"),
                  (this["drawing"] = !0),
                  window.DXBall.timeouts.push(setTimeout(function () {
                    (lightning["drawing"] = !1),
                      (lightning["is"] = !1),
                      window.DXBall.audioFiles["Voltage"]["pause"]();
                  }, 40));
              }),
              (this["draw"] = function () {
                this["drawing"] &&
                  ctx["drawImage"](
                    bigbolt_img,
                    30 * this["x"] + 20 - 65,
                    15 * this["y"] + 50 - 475
                  );
              });
          })(),
          shadow = new (function () {
            (this["drawing"] = !1),
              (this["aframe"] = 0),
              (this["draw"] = function () {
                if (this["aframe"] < 20) {
                  var _0x56c3x8 = ctx["getImageData"](0, 0, 640, 480),
                    _0x56c3x9 = _0x56c3x8["data"];
                  for (i = 0, n = _0x56c3x9["length"]; i < n; i += 4) {
                    var _0x56c3xa =
                      0.3 * _0x56c3x9[i] +
                      0.59 * _0x56c3x9[i + 1] +
                      0.11 * _0x56c3x9[i + 2];
                    (_0x56c3x9[i] = (_0x56c3x9[i] + _0x56c3xa / 5) / 1.2),
                      (_0x56c3x9[i + 1] =
                        (_0x56c3x9[i + 1] + _0x56c3xa / 5) / 1.2),
                      (_0x56c3x9[i + 2] =
                        (_0x56c3x9[i + 2] + _0x56c3xa / 5) / 1.2);
                  }
                  ctx["putImageData"](_0x56c3x8, 0, 0);
                } else {
                  if (this["aframe"] >= 20 && this["aframe"] < 70) {
                    (ctx["fillStyle"] = "rgba(0, 0, 0, 0.05)"),
                      ctx["fillRect"](0, 0, 640, 480);
                  } else {
                    if (this["aframe"] >= 70 && this["aframe"] < 100) {
                      if (
                        (70 == this["aframe"] && (paused = paus),
                        user["lives"] > 0)
                      ) {
                        for (
                          ctx["drawImage"](mbbkgrnd_img, 0, 0), y = 0;
                          y < 20;
                          y++
                        ) {
                          for (x = 0; x < 20; x++) {
                            bricks[x][y]["move"]();
                          }
                        }
                        paused &&
                          myFonts["strokeText"](
                            "PAUSED",
                            "Thefont.sbk",
                            237,
                            210
                          ),
                          _0x56c3x15(user["score"]);
                      } else {
                        highscore["draw"](), (highscore["drawing"] = 1);
                      }
                      (ctx["fillStyle"] =
                        "rgba(0, 0, 0, " +
                        (1 - 0.033 * (this["aframe"] - 70)) +
                        ")"),
                        ctx["fillRect"](0, 0, 640, 480);
                    } else {
                      this["aframe"] >= 100 &&
                        ((this["drawing"] = !1), (this["aframe"] = 0));
                    }
                  }
                }
                this["aframe"]++;
              });
          })(),
          chcur = "_",
          window.DXBall.intervals.push(setInterval(function () {
            "_" == chcur ? (chcur = " ") : (chcur = "_");
          }, 500)),
          highscore = new (function () {
            (this["loading"] = !1),
              (this["upLim"] = this["downLim"] = -1),
              (this["drawing"] = 0),
              (this["aframe"] = 0),
              (this["draw"] = function () {
                if (
                  (ctx["drawImage"](Highscor_img, 0, 0), 1 == this["drawing"])
                ) {
                  myFonts["strokeText"]("Your score:", "Sysfont.sbk", 272, 160),
                    (sc = user["score"] + ""),
                    myFonts["strokeText"](
                      user["score"],
                      "Sysfont.sbk",
                      316 - 9 * (sc["length"] - 2),
                      191
                    ),
                    myFonts["strokeText"](
                      "Enter your name:",
                      "Sysfont.sbk",
                      70,
                      220
                    ),
                    myFonts["strokeText"](
                      user["name"] + chcur,
                      "Sysfont.sbk",
                      70,
                      250
                    );
                } else {
                  if (2 == this["drawing"]) {
                    for (j = 0; j < records.length && j < 15; j++) {
                      myFonts["strokeText"](
                        records[_0x56c3xf + j]["name"],
                        "Sysfont.sbk",
                        10,
                        160 + 20 * j
                      ),
                        myFonts["strokeText"](
                          records[_0x56c3xf + j]["score"],
                          "Sysfont.sbk",
                          570,
                          160 + 20 * j
                        ),
                        myFonts["strokeText"](
                          "",
                          "Sysfont.sbk",
                          500,
                          160 + 20 * j
                        ),
                        _0x56c3xf + j == this["selection"] &&
                          ((ctx["strokeStyle"] =
                            "rgba(255,0,255," +
                            (0.7 + Math["sin"](this["aframe"] / 8) / 4) +
                            ")"),
                          ctx["strokeRect"](5, 158 + 20 * j, 630, 20),
                          this["aframe"]++);
                    }
                  }
                }
              });
          })(),
          saver = new (function () {
            (this["aframe"] = 0),
              (this["drawing"] = 1),
              (this["sinString"] =
                "WELCOME TO DX-BALL.     GREETINGS GO OUT TO:  ED + AL MACKEY, SIMEON, LARRY, MIKE BOEH, DARK UNICORN PRODUCTIONS (SHANE, JOHN, SEUMAS, ERIC (SIDEWINDER), REMEMBER KIT...), AND THE 'MAD TESTER' CHAY-BOB.     LAST MINUTE SUPER THANKS GOES TO SHANE MONROE FOR THE DX-BALL WEB PAGE.    IT ROCKS!     THIS PROJECT WAS MANY LONG MONTHS IN THE MAKING.    LATE NIGHTS, LOTS OF MOUNTAIN DEW, AND MANY PROGRAMMING BOOKS GOT THIS, MY FIRST DIRECT X AND PC GAME, FINISHED FOR YOUR VIEWING PLEASURE.      ABOUT THE GAME: I KNOW 'BREAKOUT' GAMES HAVE BEEN DONE TO DEATH, BUT I HAVEN'T FOUND ONE YET THAT'S AS COMPELLING AS MEGABALL FOR THE AMIGA COMPUTER.    SINCE MEGABALL IS MY WIFE'S FAVORITE GAME, I THOUGHT I'D MAKE HER A VERSION THAT SHE CAN PLAY ON MY PENTIUM 60.  :)      BY THE WAY, DX-BALL IS MEANT TO BE AN AMIGA GAME TRAPPED IN A PC'S BODY.   (SMILE)    ALSO GOT SOME RETRO COMMODORE 64 MIXED IN HERE AND THERE...  IF ONLY I HAD A DIRECT SOUND 'MOD' PLAYER, THEN EVERYTHING WOULD BE PERFECT!      ABOUT THE AUTHOR: HI I'M MIKE, BUT SOME CALL ME 'SCORCH.'    I'M THAT KID WHO WROTE THE AMIGA GAME 'SCORCHED TANKS.'    I KNOW, I KNOW, ALL YOU PC PEOPLE ARE SAYING 'NO STUPID, THAT'S SCORCHED EARTH!'    WELL, 'S-TANKS' WAS THE AMIGA ANSWER TO 'EARTH.'    THE WHOLE SCORCH PROJECT WAS VERY EXCELLENT AND THE RESPONSE FROM MY FELLOW AMI FANS WAS INCREDIBLE.    CERTAINLY, '94 WAS THE BEGINNING OF THE REST OF MY LIFE, AND I MUST SAY THANKS TO MY FRIENDS ALL OVER THE WORLD.        HEY, IF YOU'RE STILL READING THIS SCROLLER, THEN MORE POWER TO YA!   LET'S TALK ABOUT CODE...   DX-BALL WAS WRITTEN TO BE COMPATIBLE WITH EVERY POSSIBLE PC THAT CAN INSTALL DIRECT X 2.    I BOUGHT 4 VIDEO CARDS ON MY OWN AND BORROWED 2 VIDEO CARDS FROM MY GOOD FRIEND MIKE BOEH.    I TOOK DX-BALL TO WORK, NEIGHBOR'S HOUSE, FATHER-IN-LAW'S HOUSE, BROTHER-IN-LAW'S HOUSE, AND EVEN HAD IT TESTED WITH WINDOWS NT AS SOON AS THE NEW RELEASE SUPPORTED DIRECT X.    I EVEN ASKED/FORCED MY FRIENDS TO TAKE IT HOME AND TRY IT ON THEIR PC'S.  :O  MAN I FOUND A LOT OF BUGS IN THE GAME, AND LOTS OF QUIRKS IN DIRECT X.    I HOPE I GOT THEM ALL, BUT IF I DIDN'T, I KNOW I CAN COUNT ON 'YOU' TO SEND ME AN E-MAIL.    SO I FOUND OUT TWO IMPORTANT THINGS FROM MY EXPERIMENTS.    FIRST OF ALL, DIRECT X'S HARDWARE ACCELERATION IS VERY COOL.    SECOND, I LEARNED THAT NOT EVERY VIDEO CARD SUPPORTS IT.    FOR INSTANCE, VIDEO CARDS WITH: S3, MACH32/64, MATROX, TSENG, AND OTHERS WITH HARDWARE SUPPORT CAN SPEED-UP GRAPHICS 'BLITTING' BY AT LEAST 3X IF DONE PROPERLY.    BUT THERE ARE VERY COMMON VIDEO CARDS WITH TRIDENT OR ARK CHIPSETS THAT HAVE NO SUPPORT.    THEY WILL RUN DIRECT X GAMES, BUT THE EMULATION MODE CAN SLOW IT WAY DOWN.    UNTIL THE DAY THAT EVERYONE GETS A NEW COMPUTER OR VIDEO CARD, DIRECT X WILL NOT REACH IT'S FULL POTENTIAL.    BUT FOR NOW, US PROGRAMMERS WILL WORK OUR BRAINS OUT TO GIVE EVERYONE A CHANCE TO PLAY OUR GAMES.    DX-BALL RUNS ON ALL VIDEO CARDS, EITHER IN THE BLAZING FAST MODE, OR IN THE 'COMPATIBILITY' MODE THAT KEEPS UP WITH THE 60 FPS STANDARD.    I ONLY ASK THAT IF YOUR SYSTEM HAS A VERY HIGH REFRESH RATE... THEN MAYBE YOU OUGHT TO LOWER IT FOR THE SAKE OF PLAYING DX-BALL AT A NORMAL SPEED.  :)    WELL, I'VE TALKED ABOUT EVERYTHING NOW AND IT'S TIME TO WRAP-UP THIS EXTRA LONG SCROLLER.    THANKS FOR READING, AND ENJOY THE GAME.                                                 MADE YOU LOOK!  HEHEHEHEHEHE                                                                  "),
              (this["mballs"] = [
                ".........................................",
                ".###...#...#.....####....#...#.....#.....",
                ".#..#...#.#......#...#..#.#..#.....#.....",
                ".#...#...#...###.#..#..#...#.#.....#.....",
                ".#..#...#.#......#...#.#####.#.....#.....",
                ".###...#...#.....####..#...#.#####.#####.",
                ".........................................",
              ]),
              (this["ss"] = 0),
              (this["draw"] = function () {
                if (window.DXBall?.status !== "running") return;
                if (1 == this["drawing"]) {
                  for (
                    ctx["globalCompositeOperation"] = "lighter",
                      ctx["fillStyle"] = "rgba(255, 0, 0, 1)",
                      ctx["fillRect"](
                        0,
                        277 + parseInt(118 * Math["sin"](this["ss"] / 90)),
                        640,
                        10
                      ),
                      ctx["fillStyle"] = "rgba(0, 0, 255, 1)",
                      ctx["fillRect"](
                        0,
                        277 - parseInt(118 * Math["sin"](this["ss"] / 90)),
                        640,
                        10
                      ),
                      ctx["globalCompositeOperation"] = "source-over",
                      ctx["fillStyle"] = "rgba(0, 0, 0, 0.1)",
                      ctx["fillRect"](0, 0, 640, 480),
                      ctx["drawImage"](
                        Intro_img,
                        0,
                        0,
                        640,
                        160,
                        0,
                        0,
                        640,
                        160
                      ),
                      ctx["drawImage"](
                        Intro_img,
                        0,
                        337,
                        640,
                        14,
                        0,
                        6,
                        640,
                        14
                      ),
                      ctx["drawImage"](
                        Intro_img,
                        0,
                        364,
                        640,
                        14,
                        0,
                        128,
                        640,
                        14
                      ),
                      myFonts["strokeText"](
                        "VIDEO CARD:",
                        "Candy.sbk",
                        20,
                        174
                      ),
                      myFonts["strokeText"](
                        "REFRESH RATE ABOVE 60 MHZ",
                        "Candy.sbk",
                        180,
                        174
                      ),
                      myFonts["strokeText"](
                        "DEFAULT TO >COMPATIBLE< MODE",
                        "Candy.sbk",
                        210,
                        194
                      ),
                      myFonts["strokeText"]("AUTHOR:", "Candy.sbk", 20, 229),
                      myFonts["strokeText"](
                        "MICHAEL P. WELCH",
                        "Candy.sbk",
                        180,
                        229
                      ),
                      myFonts["strokeText"]("3D GFX:", "Candy.sbk", 20, 249),
                      myFonts["strokeText"](
                        "SEUMAS McNALLY",
                        "Candy.sbk",
                        180,
                        249
                      ),
                      myFonts["strokeText"]("E-MAIL:", "Candy.sbk", 20, 284),
                      myFonts["strokeText"](
                        "MWELCH1@STNY.LRUN.COM",
                        "Candy.sbk",
                        180,
                        284
                      ),
                      myFonts["strokeText"](
                        "VISIT   HTTP://HOME.STNY.LRUN.COM/SCORCHED/",
                        "Candy.sbk",
                        42,
                        314
                      ),
                      myFonts["strokeText"](
                        "FOR FREE BOARD EDITOR PLUS HINTS AND TIPS",
                        "Candy.sbk",
                        53,
                        334
                      ),
                      this["sx"] = 640,
                      this["sy"] = 422,
                      ctx["fillStyle"] = "#000",
                      ctx["fillRect"](0, 401, 640, 79),
                      i = 0;
                    i < this["sinString"]["length"];
                    i++
                  ) {
                    if (!myFonts?.["font"]?.["Chisel2.sbk"]?.["char"]?.[
                      this["sinString"]?.[i]
                    ]) return;
                    for (
                      j = 0;
                      j <=
                      myFonts["font"]["Chisel2.sbk"]["char"][
                        this["sinString"][i]
                      ]["width"];
                      j++
                    ) {
                      this["sx"] - this["ss"] > 40 &&
                        this["sx"] - this["ss"] < 600 &&
                        ((height =
                          myFonts["font"]["Chisel2.sbk"]["char"][
                            this["sinString"][i]
                          ]["height"]),
                        (y =
                          myFonts["font"]["Chisel2.sbk"]["char"][
                            this["sinString"][i]
                          ]["y"]),
                        ctx["drawImage"](
                          myFonts["font"]["Chisel2.sbk"]["char"][
                            this["sinString"][i]
                          ]["img"],
                          j,
                          0,
                          1,
                          height,
                          this["sx"] - this["ss"],
                          this["sy"] + y,
                          1,
                          height
                        )),
                        this["sx"]++,
                        (this["sy"] =
                          422 +
                          parseInt(
                            19 * Math["sin"]((this["sx"] - this["ss"]) / 55)
                          ));
                    }
                  }
                  this["ss"] += 6;
                } else {
                  if (2 == this["drawing"]) {
                    for (
                      ctx["drawImage"](Mainmenu_img, 0, 0, 640, 480),
                        ctx["fillStyle"] = "#cb00cb",
                        y = 0;
                      y < 7;
                      y++
                    ) {
                      for (x = 0; x <= 40; x++) {
                        (xp = parseInt(
                          115 +
                            10 * x +
                            2 * Math["sin"](this["ss"] + x / 4 + y / 3)
                        )),
                          (yp = parseInt(
                            40 +
                              10 * y +
                              2 * Math["cos"](this["ss"] + x / 4 + y / 3)
                          )),
                          "." == this["mballs"][y][x]
                            ? ctx["fillRect"](xp, yp, 1, 1)
                            : myFonts["fillImg"](
                                0,
                                "Mball2.sbk",
                                xp - 3,
                                yp - 3
                              );
                      }
                    }
                    myFonts["strokeText"](
                      "BASED ON  ``MEGABALL``",
                      "Thefont.sbk",
                      63,
                      180
                    ),
                      myFonts["strokeText"](
                        "BY ED AND AL MACKEY",
                        "Thefont.sbk",
                        77,
                        220
                      ),
                      myFonts["strokeText"](
                        "By Michael P. Welch",
                        "Sfont.sbk",
                        485,
                        124
                      ),
                      myFonts["strokeText"]("V 1.09", "Sfont.sbk", 615, 4),
                      myFonts["strokeText"](
                        "Copyright  1996-98  by Michael P. Welch,  All Rights Reserved.",
                        "Sfont.sbk",
                        3,
                        459
                      ),
                      myFonts["strokeText"](
                        "You may freely distribute this game so long as it's not sold for profit without the author's written consent.",
                        "Sfont.sbk",
                        3,
                        469
                      ),
                      (this["ss"] += 0.1),
                      ctx["drawImage"](
                        sphere_img,
                        135 * this["aframe"],
                        0,
                        135,
                        135,
                        499,
                        319,
                        135,
                        135
                      ),
                      this["aframe"]++,
                      14 == this["aframe"] && (this["aframe"] = 0);
                  }
                }
              });
          })(),
          y = -1;
        y < 21;
        y++
      ) {
        for (bricks[y] = new Array(), x = -1; x < 21; x++) {
          bricks[y][x] = new _0x56c3x17(y, x);
        }
      }

      function _0x56c3x1b() {
        (user["score"] = 0),
          (user["level"] = 1),
          (user["lives"] = 3),
          (user["timeGame"] = 0),
          _0x56c3x1c(user["level"]),
          (user["startTime"] = new Date()["getTime"]()),
          window.DXBall.timeouts.push(setTimeout(function () {
            !(function _0x56c3xc() {
              _0x56c3x10 = 0;
              window.DXBall.timeouts.push(setTimeout(function () {
                shadow["drawing"] ||
                highscore["drawing"] ||
                saver["drawing"] ||
                saver["drawing"] ||
                paused
                  ? window.DXBall.timeouts.push(setTimeout(function () {
                      _0x56c3xc();
                    }, 2e3))
                  : (_0x56c3xe = 60 / _0x56c3x10);
              }, 1e3));
            })();
          }, 3e3));
      }

      function _0x56c3x1c(_0x56c3xc) {
        for (
          _0x56c3x1d(),
            cl = !1,
            shadow["aframe"] = 20,
            clearTimeout(lightning["timout"]),
            window.DXBall.audioFiles["Voltage"]["pause"](),
            shadow["drawing"] = !0,
            _0x56c3xd = 0,
            y = 0;
          y < 20;
          y++
        ) {
          for (x = 0; x < 20; x++) {
            clearTimeout(bricks[x][y]["timeout"]),
              (bricks[x][y]["type"] = file["charCodeAt"](
                20 * y + x + 400 * (_0x56c3xc - 1)
              )),
              (bricks[x][y]["aframe"] = 0),
              0 != bricks[x][y]["type"] &&
                2 != bricks[x][y]["type"] &&
                _0x56c3xd++,
              8 == bricks[x][y]["type"] && (bricks[x][y]["aframe"] = 23);
          }
        }
      }

      function _0x56c3x1d() {
        (bonus["thru"] =
          bonus["magnet"] =
          bonus["shooting"] =
          bonus["fireball"] =
          bonus["fall"] =
          bonus["shball"] =
            !1),
          (balls["length"] = 1),
          (bullets["length"] = 0),
          (balls[0]["y"] = 460),
          (balls[0]["is"] = !0),
          (balls[0]["magnet"] = 40),
          (paddle["size"] = 1),
          (bonus["type"] = -1);
      }

      function _0x56c3x1e(_0x56c3x8) {
        for (nb = 0, i = 0; i < balls["length"]; i++) {
          1 == balls[i]["is"] && nb++;
        }
        nb <= 0 || _0x56c3x8
          ? (_0x56c3x14("Padexplo"),
            (shadow["drawing"] = !0),
            user["lives"]--,
            _0x56c3x1d())
          : _0x56c3x14("Xplosht1"),
          0 == user["lives"] &&
            (user["timeGame"] = new Date()["getTime"]() - user["startTime"]);
      }

      function _0x56c3x1f(_0x56c3x8) {
        for (
          highscore["loading"] = !0,
            _0x56c3x8 < 1 && (_0x56c3x8 = 0),
            rec = window.DXBall.calcRecords(user),
            rec = rec["split"]("\r"),
            i = 0;
          i < rec["length"] - 1;
          i++
        ) {
          (str = rec[i]),
            (str = str["split"]("&")),
            0 == i &&
              ((highscore["upLim"] > parseInt(str[0]) ||
                -1 == highscore["upLim"]) &&
                (highscore["upLim"] = parseInt(str[0])),
              (highscore["downLim"] < parseInt(str[0]) + rec["length"] ||
                -1 == highscore["downLim"]) &&
                (highscore["downLim"] = parseInt(str[0]) + rec["length"]),
              "f" == _0x56c3x8 && (_0x56c3xf = parseInt(str[0]))),
            (records[parseInt(str[0])] = new Object()),
            (records[parseInt(str[0])]["name"] = str[2]),
            (records[parseInt(str[0])]["score"] = str[1]),
            (user["name"] = user["score"] = "");
        }
        "f" == _0x56c3x8 &&
          (highscore["selection"] = parseInt(rec[rec["length"] - 1])),
          (highscore["drawing"] = 2),
          (highscore["loading"] = !1);
      }
      (mouse = new Object()),
        (mouse["x"] = mouse["y"] = 320),
        (canvas["onmousemove"] = function (_0x56c3xc) {
          _0x56c3xc || (_0x56c3xc = window["event"]),
            (mouse["x"] = "offsetX" in _0x56c3xc ? _0x56c3xc["offsetX"] : _0x56c3xc["pageX"]),
            (mouse["y"] = "offsetY" in _0x56c3xc ? _0x56c3xc["offsetY"] : _0x56c3xc["pageY"]);
        }),
        canvas["addEventListener"]("touchmove", function (_0x56c3xc) {
          (mouse["x"] = "offsetX" in _0x56c3xc["touches"][0] ? _0x56c3xc["touches"][0]["offsetX"] : _0x56c3xc["touches"][0]["pageX"]),
            (mouse["y"] = "offsetY" in _0x56c3xc["touches"][0] ? _0x56c3xc["touches"][0]["offsetY"] : _0x56c3xc["touches"][0]["pageY"]);
        }),
        (canvas["onmousedown"] = function () {
          if (
            (paus &&
              ((shadow["aframe"] = 20),
              (shadow["drawing"] = !0),
              (paus = !paus)),
            1 == saver["drawing"])
          ) {
            (saver["drawing"] = 2),
              window.DXBall.audioFiles["Whine"]["pause"](),
              (_0x56c3x11 = 0),
              window["soundon"] && _0x56c3x12["play"]();
          } else {
            if (2 == saver["drawing"]) {
              (saver["drawing"] = 0), _0x56c3x1c(user["level"]), _0x56c3x1b();
            } else {
              if (
                shadow["drawing"] ||
                highscore["drawing"] ||
                saver["drawing"] ||
                paused
              ) {
                2 == highscore["drawing"] &&
                  ((highscore["drawing"] = !1), (saver["drawing"] = 2));
              } else {
                for (i = 0; i < balls["length"]; i++) {
                  balls[i]["magnet"] = !1;
                }
                bonus["shooting"] &&
                  (_0x56c3x14("Gunfire"),
                  (i = bullets["length"]),
                  (bullets[i] = new _0x56c3x18()),
                  (bullets[i]["x"] = paddle["x"] + 3),
                  (bullets[i + 1] = new _0x56c3x18()),
                  (bullets[i + 1]["x"] = paddle["x"] + paddle["width"]));
              }
            }
          }
        }),
        (document["onkeydown"] = function (_0x56c3x8) {
          if (!highscore["loading"]) {
            if (
              (38 == _0x56c3x8["keyCode"] &&
                (window["scroll"](0, 0),
                2 == highscore["drawing"] &&
                  ((highscore["aframe"] = 0),
                  highscore["selection"] - 1 >= highscore["upLim"]
                    ? highscore["selection"]--
                    : highscore["selection"] < 15
                    ? _0x56c3x1f(1)
                    : _0x56c3x1f(highscore["selection"] - 15))),
              40 == _0x56c3x8["keyCode"] &&
                (window["scroll"](0, 0),
                2 == highscore["drawing"] &&
                  ((highscore["aframe"] = 0),
                  highscore["selection"] + 3 <= highscore["downLim"]
                    ? highscore["selection"]++
                    : _0x56c3x1f(highscore["selection"]))),
              80 != _0x56c3x8["keyCode"] ||
                0 != saver["drawing"] ||
                highscore["drawing"] ||
                ((shadow["aframe"] = 20),
                (shadow["drawing"] = !0),
                paus
                  ? (user["startTime"] += new Date()["getTime"]() - _0x56c3xa)
                  : (_0x56c3xa = new Date()["getTime"]()),
                (paus = !paus)),
              27 != _0x56c3x8["keyCode"] ||
                0 != saver["drawing"] ||
                highscore["drawing"] ||
                ((highscore["drawing"] = !1), (saver["drawing"] = 2)),
              83 == _0x56c3x8["keyCode"] && 1 == !highscore["drawing"])
            ) {
              if (((soundon = !soundon), soundon)) {
                _0x56c3x12["play"]();
              } else {
                for (_0x56c3x12["pause"](), i = 0; i < 64; i++) {
                  audio[i]["pause"]();
                }
              }
            }
            highscore["selection"] < _0x56c3xf &&
              (_0x56c3xf = highscore["selection"]),
              highscore["selection"] >= _0x56c3xf + 15 &&
                (_0x56c3xf = highscore["selection"] - 14);
          }
          if (1 == highscore["drawing"]) {
            if (
              ((ch = ""),
              user["name"]["length"] < 30 &&
                (_0x56c3x8["keyCode"] >= 48 &&
                  _0x56c3x8["keyCode"] <= 57 &&
                  (ch = _0x56c3x8["keyCode"] - 48),
                _0x56c3x8["keyCode"] >= 65 &&
                  _0x56c3x8["keyCode"] <= 90 &&
                  ((ch = String["fromCharCode"](_0x56c3x8["keyCode"])),
                  _0x56c3x8["shiftKey"] || (ch = ch["toLowerCase"]())),
                32 == _0x56c3x8["keyCode"] && (ch = " "),
                (user["name"] += ch)),
              8 == _0x56c3x8["keyCode"])
            ) {
              return (user["name"] = user["name"]["slice"](0, -1)), !1;
            }
            13 == _0x56c3x8["keyCode"] &&
              user["name"] &&
              " " != user["name"][0] &&
              _0x56c3x1f("f");
          }
        }),
        window.DXBall.intervals.push(setInterval(function () {
          _0x56c3x12["currentTime"] >= _0x56c3x12["duration"] - 1 &&
            (6 == ++_0x56c3x11 && (_0x56c3x11 = 0),
            _0x56c3x12["pause"](),
            (_0x56c3x12 = window.DXBall.audioTracks[window.DXBall.audioTracks.push(window.DXBall.audioFiles[audioName[_0x56c3x11]]["cloneNode"](!0)) - 1])[
              "play"
            ]());
        }, 100)),
        (balls[balls["length"]] = new _0x56c3x16()),
        (paddle = new (function () {
          (this["x"] = 300),
            (this["type"] = 0),
            (this["anim"] = 0),
            (this["sizes"] = [36, 73, 146, 218, 292]),
            (this["size"] = 1),
            (this["draw"] = function () {
              for (vm = !1, i = 0; i < balls["length"]; i++) {
                balls[i]["magnet"] && (vm = !0);
              }
              bonus["shooting"]
                ? (vm &&
                    myFonts["fillImg"](
                      123 + 4 * this["size"] + parseInt(this["anim"]),
                      "Mball2.sbk",
                      this["x"],
                      435
                    ),
                  myFonts["fillImg"](
                    103 + 4 * this["size"] + parseInt(this["anim"]),
                    "Mball2.sbk",
                    this["x"],
                    435
                  ))
                : vm
                ? (myFonts["fillImg"](
                    123 + 4 * this["size"] + parseInt(this["anim"]),
                    "Mball2.sbk",
                    this["x"],
                    440
                  ),
                  myFonts["fillImg"](
                    83 + 4 * this["size"] + parseInt(this["anim"]),
                    "Mball2.sbk",
                    this["x"],
                    440
                  ))
                : myFonts["fillImg"](
                    63 + 4 * this["size"] + parseInt(this["anim"]),
                    "Mball2.sbk",
                    this["x"],
                    450
                  );
            }),
            (this["move"] = function () {
              (this["width"] = this["sizes"][this["size"]]),
                (this["x"] = parseInt(
                  (mouse["x"] -
                    getOffsetSum(canvas)["left"] -
                    this["width"] / 2) /
                    (canvas["offsetWidth"] / 640)
                )),
                this["x"] < 20 && (this["x"] = 20),
                this["x"] > 620 - this["width"] &&
                  (this["x"] = 620 - this["width"]),
                (this["anim"] += 0.2),
                this["anim"] > 4 && (this["anim"] = 0),
                this["draw"]();
            });
        })()),
        (bonus = new (function (_0x56c3x8, _0x56c3xa) {
          (this["thru"] = !1),
            (this["magnet"] = !1),
            (this["shooting"] = !1),
            (this["fireball"] = !1),
            (this["fall"] = !1),
            (this["shball"] = !1),
            (this["x"] = 0),
            (this["y"] = 0),
            (this["type"] = -1),
            (this["xSpeed"] = 0),
            (this["ySpeed"] = -2),
            (this["weight"] = 0.1),
            (this["falling"] = function () {
              if (this["fall"]) {
                for (_0x56c3xa = 19; _0x56c3xa > 0; _0x56c3xa--) {
                  for (_0x56c3x8 = 0; _0x56c3x8 < 20; _0x56c3x8++) {
                    0 == bricks[_0x56c3x8][_0x56c3xa]["type"] &&
                      ((bricks[_0x56c3x8][_0x56c3xa]["type"] =
                        bricks[_0x56c3x8][_0x56c3xa - 1]["type"]),
                      (bricks[_0x56c3x8][_0x56c3xa]["aframe"] =
                        bricks[_0x56c3x8][_0x56c3xa - 1]["aframe"]),
                      (bricks[_0x56c3x8][_0x56c3xa - 1]["type"] = 0));
                  }
                }
                _0x56c3x14("Orchblas");
              }
            }),
            (this["init"] = function (_0x56c3x8, _0x56c3x9) {
              if (-1 == this["type"]) {
                for (
                  _0x56c3x14("Bang"),
                    this["xSpeed"] = balls[0]["xSpeed"],
                    this["ySpeed"] = -4,
                    this["x"] = _0x56c3x8,
                    this["y"] = _0x56c3x9,
                    this["type"] = parseInt(18 * Math["random"]()),
                    (14 != this["type"] && 19 != this["type"]) ||
                      (this["type"] = 13),
                    i = 0;
                  i < 8;
                  i++
                ) {
                  (flash[nflash] = new _0x56c3x19(
                    this["x"],
                    this["y"],
                    8 * Math["random"]() - 4,
                    8 * Math["random"]() - 4,
                    24,
                    10,
                    "255,255,255"
                  )),
                    nflash++,
                    nflash >= 128 && (nflash = 0);
                }
              }
            }),
            (this["draw"] = function () {
              myFonts["fillImg"](
                this["type"] + 34,
                "Mball2.sbk",
                this["x"],
                this["y"]
              );
            }),
            (this["move"] = function () {
              if (
                ((this["x"] += this["xSpeed"] * _0x56c3xe),
                (this["y"] += this["ySpeed"] * _0x56c3xe),
                (this["ySpeed"] += this["weight"] * _0x56c3xe),
                this["y"] > 480 && (this["type"] = -1),
                this["x"] >= 588 && ((this["x"] = 588), (this["xSpeed"] *= -1)),
                this["x"] <= 20 && ((this["x"] = 20), (this["xSpeed"] *= -1)),
                this["y"] >= 420 &&
                  this["x"] < paddle["x"] + paddle["width"] + 30 &&
                  this["x"] > paddle["x"] - 30 &&
                  this["type"] >= 0)
              ) {
                switch (((user["score"] += 100), this["type"])) {
                  case 0:
                    _0x56c3x14("Fanfare"), user["lives"]++;
                    break;
                  case 1:
                    _0x56c3x14("Peow!"),
                      (cl = !0),
                      window.DXBall.timeouts.push(setTimeout(function () {
                        user["level"]++, _0x56c3x1c(user["level"]);
                      }, 200));
                    break;
                  case 2:
                    for (
                      _0x56c3x14("Peow!"), _0x56c3xa = 0;
                      _0x56c3xa < 20;
                      _0x56c3xa++
                    ) {
                      for (_0x56c3x8 = 0; _0x56c3x8 < 20; _0x56c3x8++) {
                        2 == bricks[_0x56c3x8][_0x56c3xa]["type"] &&
                          ((bricks[_0x56c3x8][_0x56c3xa]["type"] = 20),
                          _0x56c3xd++),
                          7 == bricks[_0x56c3x8][_0x56c3xa]["type"] &&
                            (bricks[_0x56c3x8][_0x56c3xa]["type"] = 6);
                      }
                    }
                    break;
                  case 3:
                    for (_0x56c3x14("Peow!"), i = 0; i < balls["length"]; i++) {
                      (balls[i]["xSpeed"] /= 2), (balls[i]["ySpeed"] /= 2);
                    }
                    break;
                  case 4:
                    _0x56c3x14("Peow!"),
                      (function () {
                        for (y = 0; y < 20; y++) {
                          for (x = 0; x < 20; x++) {
                            8 == bricks[x][y]["type"] &&
                              ((bricks[x - 1][y]["type"] =
                                bricks[x + 1][y]["type"] =
                                bricks[x][y - 1]["type"] =
                                bricks[x][y + 1]["type"] =
                                  -1),
                              (bricks[x - 1][y]["aframe"] =
                                bricks[x + 1][y]["aframe"] =
                                bricks[x][y - 1]["aframe"] =
                                bricks[x][y + 1]["aframe"] =
                                  bricks[x][y]["aframe"]));
                          }
                        }
                        for (y = 0; y < 20; y++) {
                          for (x = 0; x < 20; x++) {
                            -1 == bricks[x][y]["type"] &&
                              (bricks[x][y]["type"] = 8);
                          }
                        }
                      })();
                    break;
                  case 5:
                    _0x56c3x14("Peow!"), (this["thru"] = !0);
                    break;
                  case 6:
                    for (
                      _0x56c3x14("Peow!"), _0x56c3xa = 0;
                      _0x56c3xa < 20;
                      _0x56c3xa++
                    ) {
                      for (_0x56c3x8 = 0; _0x56c3x8 < 20; _0x56c3x8++) {
                        8 == bricks[_0x56c3x8][_0x56c3xa]["type"] &&
                          bricks[_0x56c3x8][_0x56c3xa]["bang"](
                            _0x56c3x8,
                            _0x56c3xa
                          );
                      }
                    }
                    break;
                  case 7:
                    _0x56c3x14("Peow!"), (this["fireball"] = !0);
                    break;
                  case 8:
                    _0x56c3x14("Peow!"), (this["shooting"] = !0);
                    break;
                  case 9:
                    _0x56c3x14("Peow!"), (this["magnet"] = !0);
                    break;
                  case 10:
                    _0x56c3x14("Effect2"),
                      paddle["size"] < 4 && paddle["size"]++;
                    break;
                  case 11:
                    _0x56c3x14("Effect2"),
                      paddle["size"] > 0 && paddle["size"]--;
                    break;
                  case 12:
                    for (
                      _0x56c3x14("Peow!"), a = balls["length"], i = 0;
                      i < a;
                      i++
                    ) {
                      (t = balls["length"]),
                        balls[i]["is"] &&
                          ((balls[t] = new _0x56c3x16()),
                          (balls[t] = new _0x56c3x16()),
                          (balls[t]["x"] = balls[i]["x"]),
                          (balls[t]["y"] = balls[i]["y"]),
                          (balls[t]["xSpeed"] = balls[i]["xSpeed"]),
                          (balls[t]["ySpeed"] = balls[i]["ySpeed"] + 0.2),
                          (balls[i]["xSpeed"] -= 0.2),
                          (balls[t]["ySpeed"] /= 1.2),
                          (balls[i]["ySpeed"] /= 1.2));
                    }
                    break;
                  case 13:
                    _0x56c3x1e(!0);
                    break;
                  case 14:
                    break;
                  case 15:
                    for (_0x56c3x14("Peow!"), i = 0; i < balls["length"]; i++) {
                      (balls[i]["xSpeed"] *= 2), (balls[i]["ySpeed"] *= 2);
                    }
                    break;
                  case 16:
                    _0x56c3x14("Sweepdow"), (paddle["size"] = 0);
                    break;
                  case 17:
                    _0x56c3x14("Peow!"), (this["fall"] = !0);
                    break;
                  case 18:
                    _0x56c3x14("Peow!"),
                      (this["shball"] = !0),
                      (this["fireball"] = !1);
                }
                this["type"] = -1;
              }
              this["draw"]();
            });
        })()),
        (window["requestAnimFrame"] =
          window["requestAnimationFrame"] ||
          window["webkitRequestAnimationFrame"] ||
          window["mozRequestAnimationFrame"] ||
          window["oRequestAnimationFrame"] ||
          window["msRequestAnimationFrame"] ||
          function (_0x56c3xc, _0x56c3x8) {
            window.DXBall.timeouts.push(window["setTimeout"](_0x56c3xc, 100));
          });
      var _0x56c3x20 = 50,
        _0x56c3x21 = 0;
        window.DXBall.intervals.push(setInterval(function () {
        (_0x56c3x20 = parseInt(_0x56c3x21)), (_0x56c3x21 = 0);
      }, 1e3)),
        (ctx["fillStyle"] = "#000"),
        ctx["fillRect"](0, 0, 640, 480),
        window["saveron"] ||
          ((saver["drawing"] = !1),
          window.DXBall.audioFiles["Whine"]["pause"](),
          window["soundon"] && ((_0x56c3x11 = 0), _0x56c3x12["play"]()),
          _0x56c3x1b()),
        (function _0x56c3x8() {
          if (
            !(
              shadow?.["drawing"] ||
              highscore?.["drawing"] ||
              saver?.["drawing"] ||
              saver?.["drawing"] ||
              paused
            ) && ctx?.["drawImage"]
          ) {
            for (
              ctx["drawImage"](mbbkgrnd_img, 0, 0), paddle["move"](), y = 0;
              y < 20;
              y++
            ) {
              for (x = 0; x < 20; x++) {
                bricks[x][y]["move"]();
              }
            }
            for (i = 0; i < bullets["length"]; i++) {
              bullets[i]["move"]();
            }
            for (i = 0; i < bang["length"]; i++) {
              bang[i]["move"]();
            }
            for (i = 0; i < flash["length"]; i++) {
              flash[i]["move"]();
            }
            for (
              -1 != bonus["type"] && bonus["move"](), i = 0;
              i < balls["length"];
              i++
            ) {
              balls[i]["is"] && balls[i]["move"]();
            }
            lightning["draw"](), _0x56c3x15(user["score"]);
          }
          if (!shadow?.["drawing"] && paused) {
            for (ctx["drawImage"](mbbkgrnd_img, 0, 0), y = 0; y < 20; y++) {
              for (x = 0; x < 20; x++) {
                bricks[x][y]["move"]();
              }
            }
            _0x56c3x15(user["score"]),
              myFonts["strokeText"]("PAUSED", "Thefont.sbk", 237, 210);
          }
          (animframe += 0.1),
            animframe > 0.8 && (animframe = 0),
            saver?.["drawing"] && saver?.["draw"](),
            highscore?.["drawing"] && highscore?.["draw"](),
            shadow?.["drawing"] && shadow?.["draw"](),
            myFonts?.["strokeText"]("FPS: " + _0x56c3x20, "Sfont.sbk", 585, 468),
            _0x56c3xd <= 0 &&
              !cl &&
              ((cl = !0),
              window.DXBall.timeouts.push(setTimeout(function () {
                user["level"]++, _0x56c3x1c(user["level"]);
              }, 200))),
            _0x56c3x21++,
            _0x56c3x10++,
            requestAnimFrame?.(_0x56c3x8);
        })();
    };
    var hex_chr = "0123456789abcdef";

    function rhex(_0x56c3xc) {
      for (str = "", j = 0; j <= 3; j++) {
        str +=
          hex_chr["charAt"]((_0x56c3xc >> (8 * j + 4)) & 15) +
          hex_chr["charAt"]((_0x56c3xc >> (8 * j)) & 15);
      }
      return str;
    }

    function str2blks_MD5(_0x56c3x8) {
      for (
        nblk = 1 + ((_0x56c3x8["length"] + 8) >> 6),
          blks = new Array(16 * nblk),
          i = 0;
        i < 16 * nblk;
        i++
      ) {
        blks[i] = 0;
      }
      for (i = 0; i < _0x56c3x8["length"]; i++) {
        blks[i >> 2] |= _0x56c3x8["charCodeAt"](i) << ((i % 4) * 8);
      }
      return (
        (blks[i >> 2] |= 128 << ((i % 4) * 8)),
        (blks[16 * nblk - 2] = 8 * _0x56c3x8["length"]),
        blks
      );
    }

    function add(_0x56c3xc, _0x56c3x8) {
      var _0x56c3x9 = (65535 & _0x56c3xc) + (65535 & _0x56c3x8);
      return (
        (((_0x56c3xc >> 16) + (_0x56c3x8 >> 16) + (_0x56c3x9 >> 16)) << 16) |
        (65535 & _0x56c3x9)
      );
    }

    function rol(_0x56c3xc, _0x56c3x8) {
      return (_0x56c3xc << _0x56c3x8) | (_0x56c3xc >>> (32 - _0x56c3x8));
    }

    function cmn(
      _0x56c3xc,
      _0x56c3x8,
      _0x56c3x9,
      _0x56c3xa,
      _0x56c3xb,
      _0x56c3xd
    ) {
      return add(
        rol(
          add(add(_0x56c3x8, _0x56c3xc), add(_0x56c3xa, _0x56c3xd)),
          _0x56c3xb
        ),
        _0x56c3x9
      );
    }

    function ff(
      _0x56c3xc,
      _0x56c3x8,
      _0x56c3x9,
      _0x56c3xa,
      _0x56c3xb,
      _0x56c3xd,
      _0x56c3xe
    ) {
      return cmn(
        (_0x56c3x8 & _0x56c3x9) | (~_0x56c3x8 & _0x56c3xa),
        _0x56c3xc,
        _0x56c3x8,
        _0x56c3xb,
        _0x56c3xd,
        _0x56c3xe
      );
    }

    function gg(
      _0x56c3xc,
      _0x56c3x8,
      _0x56c3x9,
      _0x56c3xa,
      _0x56c3xb,
      _0x56c3xd,
      _0x56c3xe
    ) {
      return cmn(
        (_0x56c3x8 & _0x56c3xa) | (_0x56c3x9 & ~_0x56c3xa),
        _0x56c3xc,
        _0x56c3x8,
        _0x56c3xb,
        _0x56c3xd,
        _0x56c3xe
      );
    }

    function hh(
      _0x56c3xc,
      _0x56c3x8,
      _0x56c3x9,
      _0x56c3xa,
      _0x56c3xb,
      _0x56c3xd,
      _0x56c3xe
    ) {
      return cmn(
        _0x56c3x8 ^ _0x56c3x9 ^ _0x56c3xa,
        _0x56c3xc,
        _0x56c3x8,
        _0x56c3xb,
        _0x56c3xd,
        _0x56c3xe
      );
    }

    function ii(
      _0x56c3xc,
      _0x56c3x8,
      _0x56c3x9,
      _0x56c3xa,
      _0x56c3xb,
      _0x56c3xd,
      _0x56c3xe
    ) {
      return cmn(
        _0x56c3x9 ^ (_0x56c3x8 | ~_0x56c3xa),
        _0x56c3xc,
        _0x56c3x8,
        _0x56c3xb,
        _0x56c3xd,
        _0x56c3xe
      );
    }

    function calcMD5(_0x56c3x8) {
      for (
        x = str2blks_MD5(_0x56c3x8),
          a = 1732584193,
          b = -271733879,
          c = -1732584194,
          d = 271733878,
          i = 0;
        i < x["length"];
        i += 16
      ) {
        (olda = a),
          (oldb = b),
          (oldc = c),
          (oldd = d),
          (a = ff(a, b, c, d, x[i + 0], 7, -680876936)),
          (d = ff(d, a, b, c, x[i + 1], 12, -389564586)),
          (c = ff(c, d, a, b, x[i + 2], 17, 606105819)),
          (b = ff(b, c, d, a, x[i + 3], 22, -1044525330)),
          (a = ff(a, b, c, d, x[i + 4], 7, -176418897)),
          (d = ff(d, a, b, c, x[i + 5], 12, 1200080426)),
          (c = ff(c, d, a, b, x[i + 6], 17, -1473231341)),
          (b = ff(b, c, d, a, x[i + 7], 22, -45705983)),
          (a = ff(a, b, c, d, x[i + 8], 7, 1770035416)),
          (d = ff(d, a, b, c, x[i + 9], 12, -1958414417)),
          (c = ff(c, d, a, b, x[i + 10], 17, -42063)),
          (b = ff(b, c, d, a, x[i + 11], 22, -1990404162)),
          (a = ff(a, b, c, d, x[i + 12], 7, 1804603682)),
          (d = ff(d, a, b, c, x[i + 13], 12, -40341101)),
          (c = ff(c, d, a, b, x[i + 14], 17, -1502002290)),
          (b = ff(b, c, d, a, x[i + 15], 22, 1236535329)),
          (a = gg(a, b, c, d, x[i + 1], 5, -165796510)),
          (d = gg(d, a, b, c, x[i + 6], 9, -1069501632)),
          (c = gg(c, d, a, b, x[i + 11], 14, 643717713)),
          (b = gg(b, c, d, a, x[i + 0], 20, -373897302)),
          (a = gg(a, b, c, d, x[i + 5], 5, -701558691)),
          (d = gg(d, a, b, c, x[i + 10], 9, 38016083)),
          (c = gg(c, d, a, b, x[i + 15], 14, -660478335)),
          (b = gg(b, c, d, a, x[i + 4], 20, -405537848)),
          (a = gg(a, b, c, d, x[i + 9], 5, 568446438)),
          (d = gg(d, a, b, c, x[i + 14], 9, -1019803690)),
          (c = gg(c, d, a, b, x[i + 3], 14, -187363961)),
          (b = gg(b, c, d, a, x[i + 8], 20, 1163531501)),
          (a = gg(a, b, c, d, x[i + 13], 5, -1444681467)),
          (d = gg(d, a, b, c, x[i + 2], 9, -51403784)),
          (c = gg(c, d, a, b, x[i + 7], 14, 1735328473)),
          (b = gg(b, c, d, a, x[i + 12], 20, -1926607734)),
          (a = hh(a, b, c, d, x[i + 5], 4, -378558)),
          (d = hh(d, a, b, c, x[i + 8], 11, -2022574463)),
          (c = hh(c, d, a, b, x[i + 11], 16, 1839030562)),
          (b = hh(b, c, d, a, x[i + 14], 23, -35309556)),
          (a = hh(a, b, c, d, x[i + 1], 4, -1530992060)),
          (d = hh(d, a, b, c, x[i + 4], 11, 1272893353)),
          (c = hh(c, d, a, b, x[i + 7], 16, -155497632)),
          (b = hh(b, c, d, a, x[i + 10], 23, -1094730640)),
          (a = hh(a, b, c, d, x[i + 13], 4, 681279174)),
          (d = hh(d, a, b, c, x[i + 0], 11, -358537222)),
          (c = hh(c, d, a, b, x[i + 3], 16, -722521979)),
          (b = hh(b, c, d, a, x[i + 6], 23, 76029189)),
          (a = hh(a, b, c, d, x[i + 9], 4, -640364487)),
          (d = hh(d, a, b, c, x[i + 12], 11, -421815835)),
          (c = hh(c, d, a, b, x[i + 15], 16, 530742520)),
          (b = hh(b, c, d, a, x[i + 2], 23, -995338651)),
          (a = ii(a, b, c, d, x[i + 0], 6, -198630844)),
          (d = ii(d, a, b, c, x[i + 7], 10, 1126891415)),
          (c = ii(c, d, a, b, x[i + 14], 15, -1416354905)),
          (b = ii(b, c, d, a, x[i + 5], 21, -57434055)),
          (a = ii(a, b, c, d, x[i + 12], 6, 1700485571)),
          (d = ii(d, a, b, c, x[i + 3], 10, -1894986606)),
          (c = ii(c, d, a, b, x[i + 10], 15, -1051523)),
          (b = ii(b, c, d, a, x[i + 1], 21, -2054922799)),
          (a = ii(a, b, c, d, x[i + 8], 6, 1873313359)),
          (d = ii(d, a, b, c, x[i + 15], 10, -30611744)),
          (c = ii(c, d, a, b, x[i + 6], 15, -1560198380)),
          (b = ii(b, c, d, a, x[i + 13], 21, 1309151649)),
          (a = ii(a, b, c, d, x[i + 4], 6, -145523070)),
          (d = ii(d, a, b, c, x[i + 11], 10, -1120210379)),
          (c = ii(c, d, a, b, x[i + 2], 15, 718787259)),
          (b = ii(b, c, d, a, x[i + 9], 21, -343485551)),
          (a = add(a, olda)),
          (b = add(b, oldb)),
          (c = add(c, oldc)),
          (d = add(d, oldd));
      }
      return rhex(a) + rhex(b) + rhex(c) + rhex(d);
    }

    function getOffsetSum(_0x56c3xc) {
      for (var _0x56c3x8 = 0, _0x56c3x9 = 0; _0x56c3xc; ) {
        (_0x56c3x8 += parseFloat(_0x56c3xc["offsetTop"])),
          (_0x56c3x9 += parseFloat(_0x56c3xc["offsetLeft"])),
          (_0x56c3xc = _0x56c3xc["offsetParent"]);
      }
      return {
        top: Math["round"](_0x56c3x8),
        left: Math["round"](_0x56c3x9),
      };
    }

    dx_ball(true, true);
  },
};
