// The Quiet Gallery — procedural sound effects.
//
// Every sound is synthesized live with WebAudio: no audio files, no network.
// The context is created on the first user gesture (a click or key press), so
// browsers' autoplay rules are respected. All sounds are soft on purpose —
// this is a quiet museum at night.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
  }

  // Call from a user gesture. Safe to call repeatedly.
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  }

  // A short filtered-noise tap: a soft shoe on wooden floor.
  footstep(quiet) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const dur = 0.07;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = quiet ? 320 : 640;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(quiet ? 0.10 : 0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t);
  }

  // Two-note chime when an artifact is returned to its case.
  pickup() {
    if (!this.ctx || !this.enabled) return;
    this.tone(660, 0.12, 0.16, 'sine');
    this.tone(990, 0.22, 0.2, 'sine', 0.09);
  }

  // Sharp two-tone blip when a guard spots the archivist clearly.
  alert() {
    if (!this.ctx || !this.enabled) return;
    this.tone(880, 0.09, 0.2, 'square');
    this.tone(1174, 0.14, 0.2, 'square', 0.1);
  }

  // A single low questioning note when a guard grows suspicious.
  suspicious() {
    if (!this.ctx || !this.enabled) return;
    this.tone(440, 0.16, 0.12, 'triangle');
  }

  // A dull thud when the archivist is caught.
  caught() {
    if (!this.ctx || !this.enabled) return;
    this.tone(110, 0.35, 0.3, 'sine');
    this.tone(82, 0.45, 0.24, 'sine', 0.12);
  }

  // A small rising arpeggio when the night's work is done.
  win() {
    if (!this.ctx || !this.enabled) return;
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => this.tone(freq, 0.3, 0.18, 'sine', i * 0.13));
  }

  // One oscillator note with a quick fade. `delay` staggers notes in a phrase.
  tone(freq, dur, vol, type, delay = 0) {
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
}
