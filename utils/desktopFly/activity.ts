// "Is the human there?" — the vibration sense, ported from gnat's
// `activity.rs` (MIT). Cursor movement, clicks, and keystrokes all mean a
// human is at the keyboard; it is content-blind by construction — we never
// see a keycode, only that something changed.

export class Activity {
  private lastInput = performance.now();

  /** Rolling estimate of how busy the desktop is, 0..1. */
  private intensity = 0;

  /** Call whenever any evidence of a human arrives. */
  public poke(): void {
    this.lastInput = performance.now();
    this.intensity = Math.min(this.intensity + 0.25, 1);
  }

  /** Call once per frame to let the estimate decay. */
  public tick(dt: number): void {
    this.intensity *= Math.exp(-dt / 2);
  }

  /** Seconds since the last evidence of a human. */
  public idleFor(): number {
    return (performance.now() - this.lastInput) / 1000;
  }

  /** Substrate vibration the fly can feel, 0..1. */
  public vibration(): number {
    return this.intensity;
  }
}
