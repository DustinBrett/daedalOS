window.initCodecBox = (config) => {
  var ffworker = new Worker("/Program Files/codecbox.js/codecbox-decoder-worker.js");

  var canvas = config.canvas;
  var canvas2D = canvas.getContext("2d");
  var videoBuffers = [];
  var audioBuffers = [];
  var videoBufferThreshold = 4,
    audioBufferThreshold = 0;
  (videoBufferLimit = 12), (audioBufferLimit = 0);
  var audioBufferSize = 2048;
  var metadata;
  var startTime = -1;
  var frameCount = 0;
  var ended = false;
  var audioContext = new AudioContext();
  audioContext.suspend();
  var scriptProcessor;
  var gainNode;

  ffworker.onmessage = function (ev) {
    var msg = ev.data;
    if (msg.error) {
      config.onError?.(msg);
      console.error("Error: " + msg.type, msg);
    }
    switch (msg.type) {
      case "load":
        ffworker.postMessage({
          type: "openFile",
          data: config.file,
          sampleRate: audioContext.sampleRate,
        });
        break;
      case "openFile":
        if (!msg.error) {
          console.log("File opened:", msg);
          play(msg);
        }
        break;
      case "decode":
        config.onDecoding?.(Math.round(frameCount / metadata.frameRate));
        onDecode(msg);
        break;
      default:
        console.warn("unkown message type: " + msg.type);
    }
  };

  function play(meta) {
    meta.frameRate = Number.isNaN(meta.frameRate) ? 23.976 : meta.frameRate;
    config.onPlay?.(meta);
    ffworker.postMessage({
      type: "decode",
    });
    metadata = meta;
    audioBufferThreshold = Math.max(metadata.sampleRate * 0.1, audioBufferSize);
    audioBufferLimit = audioBufferThreshold * 10;
    clock = -1;
    if (metadata.hasVideo) {
      canvas.width = metadata.width;
      canvas.height = metadata.height;
      requestAnimationFrame(renderVideo);
    }
    if (metadata.hasAudio) {
      audioContext.resume();
      var scriptProcessor = audioContext.createScriptProcessor(1024, 0, 2);
      scriptProcessor.onaudioprocess = onaudioprocess;
      gainNode = audioContext.createGain();
      scriptProcessor.connect(gainNode).connect(audioContext.destination);
    }
    requestDecode();
  }

  function onDecode(msg) {
    if (msg.ended || msg.error) {
      ended = true;
      audioContext.suspend();
      return;
    }
    if (msg.dataType === "video") {
      videoBuffers.push(msg.data);
    } else if (msg.dataType === "audio") {
      audioBuffers.push(msg.data);
    }
    requestDecode();
  }

  function requestDecode() {
    if (needDecode()) {
      ffworker.postMessage({
        type: "decode",
      });
    }
  }

  function needDecode() {
    var abl = getAudioBufferLength(),
      vbl = videoBuffers.length;
    return (
      (metadata.hasAudio && abl <= audioBufferThreshold) ||
      (metadata.hasVideo && vbl <= videoBufferThreshold)
    );
  }

  function getAudioBufferLength() {
    return audioBuffers.reduce(function (prev, cur) {
      return prev + cur.length / 2;
    }, 0);
  }

  function renderVideo() {
    if (ended) return;
    requestAnimationFrame(renderVideo);
    if (startTime < 0) {
      if (needDecode()) return;
      startTime = performance.now();
    }
    while (
      frameCount <
      ((performance.now() - startTime) / 1000) * metadata.frameRate + 1
    ) {
      var buf = videoBuffers.shift();
      if (!buf) break;
      frameCount = frameCount + 1;
      var img = new ImageData(
        new Uint8ClampedArray(buf),
        metadata.width,
        metadata.height
      );
      canvas2D.putImageData(img, 0, 0);
      ffworker.postMessage(
        {
          type: "videoBuffer",
          data: buf,
        },
        [buf]
      );
    }
    requestDecode();
  }

  function onaudioprocess(ev) {
    if (startTime < 0) {
      if (needDecode()) return;
      startTime = performance.now();
    }
    var out = ev.outputBuffer;
    var bufs = [out.getChannelData(0), out.getChannelData(1)];
    var chn = 2,
      copied = 0;
    while (audioBuffers.length && copied < bufs[0].length) {
      var ab = audioBuffers.shift();
      var limit = Math.min((bufs[0].length - copied) * chn, ab.length);
      for (var j = 0; j < limit; j += chn) {
        for (var k = 0; k < chn; k++) {
          bufs[k][copied + j / chn] = ab[j + k];
        }
      }
      copied += limit / chn;
      if (copied === bufs[0].length) {
        if (limit < ab.length) {
          ab = ab.subarray(limit);
          audioBuffers.unshift(ab);
        }
        break;
      }
    }
    requestDecode();
  }

  return {
    exit: () => {
      audioContext.suspend();
      ffworker.terminate();
    },
    pause: () => {
      ffworker.postMessage({
        type: "pause",
      });
    },
    volume: (v) => {
      if (gainNode) gainNode.gain.value = v;
    },
  }
};
