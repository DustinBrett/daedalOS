(function () {
  var videoBuffers = [];
  var decoder;
  var dir = "/decoding";

  self.Module = {};

  Module.onRuntimeInitialized = function () {
    self.CodecBoxDecoder = Module.CodecBoxDecoder;
    self.CodecBoxDecoderState = Module.CodecBoxDecoderState;
    postMessage({ type: "load" });
    FS.mkdir(dir);
  };

  importScripts("/Program Files/codecbox.js/codecbox.js");

  onmessage = function (ev) {
    var msg = ev.data;

    switch (msg.type) {
      case "openFile":
        openFile(msg);
        break;
      case "videoBuffer":
        videoBuffers.push(msg.data);
        break;
      case "decode":
        decode();
        break;
      case "pause":
        break;
      default:
        console.warn("unkown message type: " + msg.type);
    }
  };

  function openFile(msg) {
    var file = msg.data;
    var fileName = file.name || "input.bin";

    FS.mount(WORKERFS, { blobs: [{ name: fileName, data: file }] }, dir);
    var path = dir + "/" + fileName;
    decoder = new CodecBoxDecoder(new TextEncoder("utf-8").encode(path));

    var type = "openFile";
    if (decoder.state.value < CodecBoxDecoderState.Metadata.value) {
      onError(type, new Error("failed to open: " + path));
    } else {
      if (msg.sampleRate) decoder.sampleRate = msg.sampleRate;
      else console.warn("openFile: sample rate not set!");
      postMessage({
        type: type,
        fileName: fileName,
        hasVideo: decoder.hasVideo && decoder.videoEnabled,
        hasAudio: decoder.hasAudio && decoder.audioEnabled,
        frameRate: decoder.frameRate,
        duration: decoder.duration,
        width: decoder.width,
        height: decoder.height,
        sampleRate: decoder.sampleRate,
        channels: decoder.channels,
      });
    }
  }

  function decode() {
    decoder.decode();
    var rs = decoder.state;
    var type = "decode";
    if (rs === CodecBoxDecoderState.Failed) {
      onError(type, new Error("failed to decode"));
    } else if (rs === CodecBoxDecoderState.Ended) {
      postMessage({ type: type, ended: true });
    } else if (rs === CodecBoxDecoderState.Video) {
      var buf = videoBuffers.pop();
      if (!buf) buf = new ArrayBuffer(decoder.width * decoder.height * 4);
      var dest = new Uint8Array(buf);
      var src = new Uint8Array(
        Module.HEAPU8.buffer,
        decoder.buffer,
        dest.length,
      );
      dest.set(src);
      postMessage({ type: type, dataType: "video", data: dest.buffer }, [
        dest.buffer,
      ]);
    } else if (rs === CodecBoxDecoderState.Audio) {
      var dest = new Float32Array(decoder.bufferSampleCount * decoder.channels);
      var src = new Float32Array(
        Module.HEAPU8.buffer,
        decoder.buffer,
        dest.length,
      );
      dest.set(src);
      postMessage({ type: type, dataType: "audio", data: dest }, [dest.buffer]);
    } else {
      postMessage({ type: type, dataType: "inert" });
    }
  }

  function onError(type, e) {
    var msg = {
      type: type,
      error: formatError(e),
    };
    postMessage(msg);
  }

  function formatError(e) {
    return { message: e.message, stack: e.stack };
  }
})();
