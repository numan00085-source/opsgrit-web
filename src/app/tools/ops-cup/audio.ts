/** Synthesised sound effects and crowd noise. No audio files are loaded. */
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private crowdGain: GainNode | null = null;
  muted = false;

  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.9;
        this.master.connect(this.ctx.destination);
        this.startCrowd();
      }
      void this.ctx.resume();
    } catch {
      /* sound is optional */
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  private startCrowd() {
    const c = this.ctx!;
    const len = c.sampleRate * 3;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.04 * w) / 1.04; // brown-ish noise
      d[i] = last * 3.2;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 520;
    bp.Q.value = 0.35;
    this.crowdGain = c.createGain();
    this.crowdGain.gain.value = 0.0;
    src.connect(bp).connect(this.crowdGain).connect(this.master!);
    src.start();
    this.crowdGain.gain.setTargetAtTime(0.1, c.currentTime, 1.2);
  }

  crowd(level: number, speed = 0.5) {
    if (this.ctx && this.crowdGain) this.crowdGain.gain.setTargetAtTime(level, this.ctx.currentTime, speed);
  }

  private blip(f: number, dur: number, type: OscillatorType, vol: number, slide = 0, delay = 0) {
    const c = this.ctx;
    if (!c || !this.master || this.muted) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol: number, freq: number, q = 1, delay = 0, type: BiquadFilterType = "bandpass") {
    const c = this.ctx;
    if (!c || !this.master || this.muted) return;
    const t = c.currentTime + delay;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource();
    s.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.value = vol;
    s.connect(f).connect(g).connect(this.master);
    s.start(t);
  }

  kick(power = 0.5) {
    this.blip(150 + power * 60, 0.12, "sine", 0.35 + power * 0.25, -90);
    this.noise(0.07, 0.15 + power * 0.15, 900);
  }
  pass() { this.blip(190, 0.09, "sine", 0.22, -70); this.noise(0.05, 0.08, 1200); }
  tackle() { this.noise(0.18, 0.28, 300, 0.7); this.blip(110, 0.15, "sine", 0.3, -50); }
  slide() { this.noise(0.22, 0.12, 2400, 0.6, 0, "highpass"); }
  bounce(a = 0.5) { this.blip(120, 0.09, "sine", 0.1 + a * 0.15, -40); }
  post() { this.blip(880, 0.5, "triangle", 0.25, -300); this.blip(1320, 0.4, "sine", 0.12, -500); this.crowd(0.2, 0.05); setTimeout(() => this.crowd(0.1, 0.8), 350); }
  save() { this.noise(0.12, 0.25, 700); this.blip(160, 0.12, "sine", 0.25, -60); }
  net() { this.noise(0.4, 0.18, 3200, 0.6, 0, "highpass"); }
  whistle(long = false) {
    const d = long ? 0.9 : 0.35;
    const c = this.ctx;
    if (!c || !this.master || this.muted) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const lfo = c.createOscillator();
    const lg = c.createGain();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = 2650;
    lfo.frequency.value = 36;
    lg.gain.value = 90;
    lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.03);
    g.gain.setValueAtTime(0.14, t + d - 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(this.master);
    o.start(t); lfo.start(t);
    o.stop(t + d + 0.02); lfo.stop(t + d + 0.02);
  }
  goal() {
    this.crowd(0.42, 0.08);
    setTimeout(() => this.crowd(0.1, 2.2), 2300);
    this.noise(1.4, 0.3, 700, 0.4);
    [523, 659, 784, 1047].forEach((f, i) => this.blip(f, 0.32, "triangle", 0.12, 0, i * 0.11));
    this.whistle(false);
  }
  click() { this.blip(520, 0.05, "square", 0.05); }
  start() { [392, 523, 659].forEach((f, i) => this.blip(f, 0.18, "triangle", 0.1, 0, i * 0.09)); }
}
