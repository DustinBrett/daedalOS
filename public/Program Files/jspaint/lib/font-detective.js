(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var after, domReady, every;

after = function(ms, fn) {
  var tid;
  tid = setTimeout(fn, ms);
  return {
    stop: function() {
      return clearTimeout(tid);
    }
  };
};

every = function(ms, fn) {
  var iid;
  iid = setInterval(fn, ms);
  return {
    stop: function() {
      return clearInterval(iid);
    }
  };
};

domReady = function(callback) {
  if (/in/.test(document.readyState)) {
    return after(10, function() {
      return domReady(callback);
    });
  } else {
    return callback();
  }
};

(function(exports) {
  var FD, Font, container, doneTestingFonts, fontAvailabilityChecker, genericFontFamilies, loadFonts, someCommonFontNames, startedLoading, testFonts, testedFonts;
  FD = exports.FontDetective = {};
  genericFontFamilies = ["serif", "sans-serif", "cursive", "fantasy", "monospace"];
  someCommonFontNames = "Helvetica,Lucida Grande,Lucida Sans,Tahoma,Arial,Geneva,Monaco,Verdana,Microsoft Sans Serif,Trebuchet MS,Courier New,Times New Roman,Courier,Lucida Bright,Lucida Sans Typewriter,URW Chancery L,Comic Sans MS,Georgia,Palatino Linotype,Lucida Sans Unicode,Times,Century Schoolbook L,URW Gothic L,Franklin Gothic Medium,Lucida Console,Impact,URW Bookman L,Helvetica Neue,Nimbus Sans L,URW Palladio L,Nimbus Mono L,Nimbus Roman No9 L,Arial Black,Sylfaen,MV Boli,Estrangelo Edessa,Tunga,Gautami,Raavi,Mangal,Shruti,Latha,Kartika,Vrinda,Arial Narrow,Century Gothic,Garamond,Book Antiqua,Bookman Old Style,Calibri,Cambria,Candara,Corbel,Monotype Corsiva,Cambria Math,Consolas,Constantia,MS Reference Sans Serif,MS Mincho,Segoe UI,Arial Unicode MS,Tempus Sans ITC,Kristen ITC,Mistral,Meiryo UI,Juice ITC,Papyrus,Bradley Hand ITC,French Script MT,Malgun Gothic,Microsoft YaHei,Gisha,Leelawadee,Microsoft JhengHei,Haettenschweiler,Microsoft Himalaya,Microsoft Uighur,MoolBoran,Jokerman,DFKai-SB,KaiTi,SimSun-ExtB,Freestyle Script,Vivaldi,FangSong,MingLiU-ExtB,MingLiU_HKSCS,MingLiU_HKSCS-ExtB,PMingLiU-ExtB,Copperplate Gothic Light,Copperplate Gothic Bold,Franklin Gothic Book,Maiandra GD,Perpetua,Eras Demi ITC,Felix Titling,Franklin Gothic Demi,Pristina,Edwardian Script ITC,OCR A Extended,Engravers MT,Eras Light ITC,Franklin Gothic Medium Cond,Rockwell Extra Bold,Rockwell,Curlz MT,Blackadder ITC,Franklin Gothic Heavy,Franklin Gothic Demi Cond,Lucida Handwriting,Segoe UI Light,Segoe UI Semibold,Lucida Calligraphy,Cooper Black,Viner Hand ITC,Britannic Bold,Wide Latin,Old English Text MT,Broadway,Footlight MT Light,Harrington,Snap ITC,Onyx,Playbill,Bauhaus 93,Baskerville Old Face,Algerian,Matura MT Script Capitals,Stencil,Batang,Chiller,Harlow Solid Italic,Kunstler Script,Bernard MT Condensed,Informal Roman,Vladimir Script,Bell MT,Colonna MT,High Tower Text,Californian FB,Ravie,Segoe Script,Brush Script MT,SimSun,Arial Rounded MT Bold,Berlin Sans FB,Centaur,Niagara Solid,Showcard Gothic,Niagara Engraved,Segoe Print,Gabriola,Gill Sans MT,Iskoola Pota,Calisto MT,Script MT Bold,Century Schoolbook,Berlin Sans FB Demi,Magneto,Arabic Typesetting,DaunPenh,Mongolian Baiti,DokChampa,Euphemia,Kalinga,Microsoft Yi Baiti,Nyala,Bodoni MT Poster Compressed,Goudy Old Style,Imprint MT Shadow,Gill Sans MT Condensed,Gill Sans Ultra Bold,Palace Script MT,Lucida Fax,Gill Sans MT Ext Condensed Bold,Goudy Stout,Eras Medium ITC,Rage Italic,Rockwell Condensed,Castellar,Eras Bold ITC,Forte,Gill Sans Ultra Bold Condensed,Perpetua Titling MT,Agency FB,Tw Cen MT,Gigi,Tw Cen MT Condensed,Aparajita,Gloucester MT Extra Condensed,Tw Cen MT Condensed Extra Bold,PMingLiU,Bodoni MT,Bodoni MT Black,Bodoni MT Condensed,MS Gothic,GulimChe,MS UI Gothic,MS PGothic,Gulim,MS PMincho,BatangChe,Dotum,DotumChe,Gungsuh,GungsuhChe,MingLiU,NSimSun,SimHei,DejaVu Sans,DejaVu Sans Condensed,DejaVu Sans Mono,DejaVu Serif,DejaVu Serif Condensed,Eurostile,Matisse ITC,Bitstream Vera Sans Mono,Bitstream Vera Sans,Staccato222 BT,Bitstream Vera Serif,Broadway BT,ParkAvenue BT,Square721 BT,Calligraph421 BT,MisterEarl BT,Cataneo BT,Ruach LET,Rage Italic LET,La Bamba LET,Blackletter686 BT,John Handy LET,Scruff LET,Westwood LET".split(",").sort();
  testedFonts = [];
  doneTestingFonts = false;
  startedLoading = false;
  container = document.createElement("div");
  container.id = "font-detective";

  /*
  	 * A font class that can be stringified for use in css
  	 * e.g. font.toString() or (font + ", sans-serif")
   */
  Font = (function() {
    function Font(name, type, style) {
      this.name = name;
      this.type = type;
      this.style = style;
    }

    Font.prototype.toString = function() {
      return '"' + this.name.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + '"';
    };

    return Font;

  })();
  fontAvailabilityChecker = (function() {
    var baseFontFamilies, baseHeights, baseWidths, span;
    baseFontFamilies = ["monospace", "sans-serif", "serif"];
    span = document.createElement("span");
    span.innerHTML = "mmmmmmmmmmlli";
    span.style.fontSize = "72px";
    baseWidths = {};
    baseHeights = {};
    return {
      init: function() {
        var baseFontFamily, j, len, results;
        document.body.appendChild(container);
        results = [];
        for (j = 0, len = baseFontFamilies.length; j < len; j++) {
          baseFontFamily = baseFontFamilies[j];
          span.style.fontFamily = baseFontFamily;
          container.appendChild(span);
          baseWidths[baseFontFamily] = span.offsetWidth;
          baseHeights[baseFontFamily] = span.offsetHeight;
          results.push(container.removeChild(span));
        }
        return results;
      },
      check: function(font) {
        var baseFontFamily, differs, j, len;
        for (j = 0, len = baseFontFamilies.length; j < len; j++) {
          baseFontFamily = baseFontFamilies[j];
          span.style.fontFamily = font + ", " + baseFontFamily;
          container.appendChild(span);
          differs = span.offsetWidth !== baseWidths[baseFontFamily] || span.offsetHeight !== baseHeights[baseFontFamily];
          container.removeChild(span);
          if (differs) {
            return true;
          }
        }
        return false;
      }
    };
  })();
  loadFonts = function() {
    if (startedLoading) {
      return;
    }
    startedLoading = true;
    FD.incomplete = true;
    return domReady((function(_this) {
      return function() {
        var fontName;
        return testFonts((function() {
          var j, len, results;
          results = [];
          for (j = 0, len = someCommonFontNames.length; j < len; j++) {
            fontName = someCommonFontNames[j];
            results.push(new Font(fontName));
          }
          return results;
        })());
      };
    })(this));
  };
  testFonts = function(fonts) {
    var i, testingFonts;
    fontAvailabilityChecker.init();
    i = 0;
    return testingFonts = every(20, function() {
      var available, callback, font, j, k, l, len, len1, ref, ref1;
      for (j = 0; j <= 5; j++) {
        font = fonts[i];
        available = fontAvailabilityChecker.check(font);
        if (available) {
          testedFonts.push(font);
          ref = FD.each.callbacks;
          for (k = 0, len = ref.length; k < len; k++) {
            callback = ref[k];
            callback(font);
          }
        }
        i++;
        if (i >= fonts.length) {
          testingFonts.stop();
          ref1 = FD.all.callbacks;
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            callback = ref1[l];
            callback(testedFonts);
          }
          FD.all.callbacks = [];
          FD.each.callbacks = [];
          doneTestingFonts = true;
          return;
        }
      }
    });
  };

  /*
  	 * FontDetective.preload()
  	 * Starts detecting fonts early
   */
  FD.preload = loadFonts;

  /*
  	 * FontDetective.each(function(font){})
  	 * Calls back with a `Font` every time a font is detected and tested
   */
  FD.each = function(callback) {
    var font, j, len;
    for (j = 0, len = testedFonts.length; j < len; j++) {
      font = testedFonts[j];
      callback(font);
    }
    if (!doneTestingFonts) {
      FD.each.callbacks.push(callback);
      return loadFonts();
    }
  };
  FD.each.callbacks = [];

  /*
  	 * FontDetective.all(function(fonts){})
  	 * Calls back with an `Array` of `Font`s when all fonts are detected and tested
   */
  FD.all = function(callback) {
    if (doneTestingFonts) {
      return callback(testedFonts);
    } else {
      FD.all.callbacks.push(callback);
      return loadFonts();
    }
  };
  return FD.all.callbacks = [];
})(window);


},{}]},{},[1]);
