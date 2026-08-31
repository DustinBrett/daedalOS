// The sound of the flies — off by default, switched with `fly audio on` /
// `fly audio off` in the terminal. Nothing plays until asked.
//
// A fly is not a tone generator. What you actually hear is turbulent air
// being chopped at the wingbeat rate: a harmonic series from the wing's
// non-sinusoidal stroke, plus a broad hiss from the vortices it sheds, both
// pulsed once per beat. Two details from the measurements matter:
//
//  - Free-flight wingbeat runs 215.6 Hz in the smallest flies to 261.2 Hz
//    in the largest, so this is a per-individual pitch, not one note. Note
//    the direction: bigger flies beat *faster*, which is the opposite of
//    the usual allometric guess.
//  - The first and second harmonics alternate as the strongest partial, and
//    the first six partials sit within 1 Hz of exact integer multiples. So
//    the second harmonic is carried explicitly rather than left to a
//    sawtooth's 1/n roll-off.
//
// Loudness is measured, not guessed: a fly in typical flight lands around
// 7% of Webamp's level at its default volume. See the header comment on
// VOICE_GAIN.

import { type Fly, FlyState } from "utils/desktopFly/fly";

/**
 * Wingbeat frequency of the smallest flies in free flight, Hz. Larger
 * individuals run up to 261 Hz — see SIZE_HZ.
 */
const WINGBEAT_HZ = 215;
/** Hz added across the full body-size range, smallest to largest. */
const SIZE_HZ = 164;
/** How much effort raises the wingbeat, Hz at full effort. */
const EFFORT_HZ = 30;
/**
 * Per-voice loudness ceiling.
 *
 * Calibrated by rendering the graph offline and measuring it: with this
 * value a fly in typical flight sits near 7% of Webamp's amplitude at
 * Webamp's default volume, which is the "quiet but clearly there" band.
 * Change it and re-measure — the perceived level depends on the tone/noise
 * mix and the modulation depth as much as on this number, so it cannot be
 * reasoned about from the constant alone.
 */
const VOICE_GAIN = 0.07;
const MASTER_GAIN = 0.55;
/** Smoothing time constant for gain/frequency moves, seconds. */
const SMOOTH = 0.04;
/** Mix between the tonal wingbeat and the turbulence that rides on it. */
const TONE_MIX = 0.55;
const NOISE_MIX = 0.45;
/**
 * Level of the explicit second harmonic, relative to the fundamental. The
 * measured spectrum has the first two partials trading the lead, which a
 * bare sawtooth (second partial at half the first) does not reproduce.
 */
const HARMONIC_MIX = 0.7;
/** How deeply the wingbeat chops the sound. This is the buzz's rasp. */
const AM_DEPTH = 0.45;
/** Seconds of white noise looped as the turbulence source. */
const NOISE_SECONDS = 2;

/**
 * Everything that sets how loud and how bright a voice is, in one place so
 * a test can render the graph offline and measure it. Loudness here cannot
 * be reasoned about from any single number — the tone/noise mix and the
 * modulation depth move it as much as the gains do — so it is checked by
 * measurement.
 */
const AUDIO_CALIBRATION = {
  amDepth: AM_DEPTH,
  /** Lowpass on the tonal half: `base + span * effort`, Hz. */
  cutoffBase: 900,
  cutoffSpan: 700,
  effortHz: EFFORT_HZ,
  harmonicMix: HARMONIC_MIX,
  /** How much of the level a fly loses at the top of its arc. */
  heightDrop: 0.25,
  masterGain: MASTER_GAIN,
  noiseCentreHz: 1500,
  noiseMix: NOISE_MIX,
  noiseQ: 0.8,
  sizeHz: SIZE_HZ,
  toneMix: TONE_MIX,
  toneQ: 0.9,
  voiceGain: VOICE_GAIN,
  wingbeatHz: WINGBEAT_HZ,
} as const;

type Voice = {
  /** Wingbeat-rate amplitude modulation: the chop that makes it a buzz. */
  am: GainNode;
  amDepth: GainNode;
  amOsc: OscillatorNode;
  gain: GainNode;
  /** The explicit second partial. */
  harmonic: OscillatorNode;
  noiseFilter: BiquadFilterNode;
  noiseGain: GainNode;
  osc: OscillatorNode;
  panner: StereoPannerNode;
  toneFilter: BiquadFilterNode;
  toneGain: GainNode;
  /** This individual's wingbeat offset, in Hz. No two flies match. */
  tune: number;
};

export class FlyAudio {
  private ctx?: AudioContext;

  private master?: GainNode;

  /** One looping noise source, tapped by every voice. */
  private noise?: AudioBufferSourceNode;

  private readonly voices = new Map<Fly, Voice>();

  private readonly resumeOnGesture = (): void => {
    this.ctx?.resume().catch(() => {
      // Resume can be blocked until a user gesture; the listeners retry.
    });
  };

  /** Start the audio graph. Safe to call repeatedly. */
  public enable(): boolean {
    if (typeof window.AudioContext !== "function") return false;
    if (this.ctx) return true;

    const ctx = new AudioContext();

    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = MASTER_GAIN;
    this.master.connect(ctx.destination);

    // The shared turbulence source. One buffer, one player, many taps.
    const frames = Math.floor(ctx.sampleRate * NOISE_SECONDS);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < frames; i += 1) channel[i] = Math.random() * 2 - 1;

    this.noise = ctx.createBufferSource();
    this.noise.buffer = buffer;
    this.noise.loop = true;
    this.noise.start();

    // The terminal command usually counts as a user gesture; if the
    // context still starts suspended, the next press wakes it.
    if (ctx.state === "suspended") {
      this.resumeOnGesture();
      window.addEventListener("pointerdown", this.resumeOnGesture, {
        once: true,
        passive: true,
      });
      window.addEventListener("keydown", this.resumeOnGesture, {
        once: true,
        passive: true,
      });
    }

    return true;
  }

  public disable(): void {
    window.removeEventListener("pointerdown", this.resumeOnGesture);
    window.removeEventListener("keydown", this.resumeOnGesture);
    this.voices.forEach((voice) => this.stopVoice(voice));
    this.voices.clear();
    try {
      this.noise?.stop();
    } catch {
      // Already stopped.
    }
    this.noise = undefined;
    this.ctx?.close().catch(() => {
      // Already closed.
    });
    this.ctx = undefined;
    this.master = undefined;
  }

  public get enabled(): boolean {
    return this.ctx !== undefined;
  }

  private stopVoice(voice: Voice): void {
    [voice.osc, voice.amOsc, voice.harmonic].forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Already stopped.
      }
    });
  }

  private voiceFor(fly: Fly): Voice | undefined {
    const { ctx, master, noise } = this;

    if (!ctx || !master || !noise) return undefined;

    let voice = this.voices.get(fly);

    if (!voice) {
      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      const toneFilter = ctx.createBiquadFilter();
      const toneGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();
      const am = ctx.createGain();
      const amOsc = ctx.createOscillator();
      const amDepth = ctx.createGain();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      // Wingbeat frequency is set by the animal. Measured across free-flying
      // D. melanogaster it runs 215 Hz in the smallest to 261 Hz in the
      // largest, so body size picks this fly's pitch out of a ~46 Hz spread.
      const tune = (fly.phenotype.size - 0.86) * SIZE_HZ;

      // The tonal half: a sawtooth carries the harmonics a wing stroke has,
      // rolled off so it reads as an insect rather than a buzzer.
      osc.type = "sawtooth";
      osc.frequency.value = WINGBEAT_HZ + tune;
      harmonic.type = "sine";
      harmonic.frequency.value = (WINGBEAT_HZ + tune) * 2;
      harmonicGain.gain.value = HARMONIC_MIX;
      toneFilter.type = "lowpass";
      toneFilter.frequency.value = AUDIO_CALIBRATION.cutoffBase + 350;
      toneFilter.Q.value = AUDIO_CALIBRATION.toneQ;
      toneGain.gain.value = TONE_MIX;

      // The turbulent half: a band of hiss where the shed vortices live.
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = AUDIO_CALIBRATION.noiseCentreHz;
      noiseFilter.Q.value = AUDIO_CALIBRATION.noiseQ;
      noiseGain.gain.value = NOISE_MIX;

      // Both halves are chopped at the wingbeat. Modulating at the carrier's
      // own frequency is what turns a note into a buzz.
      amOsc.type = "sine";
      amOsc.frequency.value = WINGBEAT_HZ + tune;
      amDepth.gain.value = AM_DEPTH;
      am.gain.value = 1 - AM_DEPTH;
      amOsc.connect(amDepth);
      amDepth.connect(am.gain);

      osc.connect(toneFilter);
      harmonic.connect(harmonicGain);
      harmonicGain.connect(toneFilter);
      toneFilter.connect(toneGain);
      toneGain.connect(am);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(am);
      am.connect(gain);
      gain.connect(panner);
      panner.connect(master);
      gain.gain.value = 0;
      osc.start();
      harmonic.start();
      amOsc.start();

      voice = {
        am,
        amDepth,
        amOsc,
        gain,
        harmonic,
        noiseFilter,
        noiseGain,
        osc,
        panner,
        toneFilter,
        toneGain,
        tune,
      };
      this.voices.set(fly, voice);
    }

    return voice;
  }

  /** Called once per frame with the living flies. */
  public update(flies: readonly Fly[], sceneWidth: number): void {
    if (!this.ctx || !this.master) return;

    const now = this.ctx.currentTime;
    const alive = new Set<Fly>();

    flies.forEach((fly) => {
      const airborne = fly.state === FlyState.Flying;
      const caught = fly.state === FlyState.Caught;

      if (!airborne && !caught) return;

      const voice = this.voiceFor(fly);

      if (!voice) return;
      alive.add(fly);

      // Wingbeat frequency follows this fly's live effort, around its own
      // resting rate, with a little wander — no animal holds a pitch.
      const wander = Math.sin(fly.time * 3.1) * 2.5;
      const freq =
        WINGBEAT_HZ +
        voice.tune +
        EFFORT_HZ * (fly.effortCurrent - 0.25) +
        wander;

      let level = VOICE_GAIN * (0.35 + 0.65 * fly.effortCurrent);

      if (caught) {
        // Furious uneven bursts under the fingertip.
        const burst =
          0.5 + 0.5 * Math.sin(fly.time * 27) * Math.sin(fly.time * 8.3);

        level = VOICE_GAIN * (0.6 + 0.9 * fly.struggle) * burst;
      } else {
        // Height reads as distance: a fly at the top of its arc is fainter.
        // Gently, so that effort still governs how loud it is.
        level *=
          1 - AUDIO_CALIBRATION.heightDrop * Math.min(Math.max(fly.alt, 0), 1);
      }

      voice.osc.frequency.setTargetAtTime(freq, now, SMOOTH);
      voice.harmonic.frequency.setTargetAtTime(freq * 2, now, SMOOTH);
      voice.amOsc.frequency.setTargetAtTime(freq, now, SMOOTH);
      // Harder work is brighter: the harmonics and the hiss both come up.
      voice.toneFilter.frequency.setTargetAtTime(
        AUDIO_CALIBRATION.cutoffBase +
          AUDIO_CALIBRATION.cutoffSpan * fly.effortCurrent,
        now,
        SMOOTH
      );
      voice.gain.gain.setTargetAtTime(level, now, SMOOTH);
      voice.panner.pan.setTargetAtTime(
        Math.min(Math.max(fly.pos.x / (sceneWidth / 2 || 1), -1), 1),
        now,
        SMOOTH
      );
    });

    // Grounded or gone: fade out and drop the voice.
    this.voices.forEach((voice, fly) => {
      if (!alive.has(fly)) {
        voice.gain.gain.setTargetAtTime(0, now, SMOOTH);
        if (voice.gain.gain.value < 0.001) {
          this.stopVoice(voice);
          this.voices.delete(fly);
        }
      }
    });
  }
}
