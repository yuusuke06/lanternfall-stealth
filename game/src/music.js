// The night museum's score: an original generative piece in the
// spirit of a moonlit piano miniature. A slow chord cycle (Dm9 —
// Bbmaj7 — Fmaj9 — A7sus) is played by three voices, all synthesised:
// a felt piano that states the chords, a music box that wanders a
// pentatonic melody above them, and a soft string pad underneath.
// When a guard's suspicion rises, a tension voice joins — a quiet,
// pulsing high string — and falls silent again when the danger passes.
// No audio files: every note is an oscillator shaped in code.

const NOTE_FREQ = (() => {
  const names = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  return (name, octave) => {
    const sharp = name.endsWith('#') ? 1 : 0;
    const base = names[name[0]] + sharp;
    const midi = 12 * (octave + 1) + base;
    return 440 * Math.pow(2, (midi - 69) / 12);
  };
})();

// One chord per bar, four bars to a cycle: root, chord tones, and the
// music-box melody notes that belong to it.
const PROGRESSION = [
  { pad: ['D3', 'A3'], piano: ['D4', 'F4', 'A4', 'C5'], melody: ['A4', 'C5', 'E5', 'F5', 'D5'] },
  { pad: ['Bb2', 'F3'], piano: ['Bb3', 'D4', 'F4', 'A4'], melody: ['F4', 'A4', 'D5', 'C5', 'Bb4'] },
  { pad: ['F3', 'C4'], piano: ['F4', 'A4', 'C5', 'E5'], melody: ['E5', 'C5', 'A4', 'G4', 'A4'] },
  { pad: ['A2', 'E3'], piano: ['A3', 'G4', 'B4', 'E5'], melody: ['B4', 'E5', 'D5', 'C5', 'G4'] },
];

// The composed melody line, one phrase of eight bars, in scale steps
// into each bar's melody set (-1 rests). It returns to its opening
// figure at the end, the way a theme comes home.
const MELODY_LINE = [
  [0, -1, 2, -1], [1, -1, -1, 3], [0, -1, 1, -1], [2, -1, -1, -1],
  [4, -1, 3, 2], [1, -1, 2, -1], [3, -1, 1, 0], [-1, -1, -1, -1],
];

const BAR_SECONDS = 3.4;

let engine = null;

function buildEngine() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  const ctx = new AudioCtor();
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  // A long, quiet feedback delay gives the piano its empty-hall air.
  const delay = ctx.createDelay(1.5);
  delay.delayTime.value = 0.42;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.32;
  const delayFilter = ctx.createBiquadFilter();
  delayFilter.type = 'lowpass';
  delayFilter.frequency.value = 1800;
  delay.connect(delayFilter).connect(delayGain).connect(delay);
  delayGain.connect(master);
  return { ctx, master, delay, bar: 0, nextBarTime: 0, timer: null, tension: 0 };
}

function pianoNote(engine, freq, time, volume = 0.11, duration = 2.6) {
  const { ctx, master, delay } = engine;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain);
  gain.connect(master);
  gain.connect(delay);
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

function musicBoxNote(engine, freq, time, volume = 0.075) {
  const { ctx, master, delay } = engine;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const harmonic = ctx.createOscillator();
  harmonic.type = 'sine';
  harmonic.frequency.value = freq * 3.98;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);
  const harmonicGain = ctx.createGain();
  harmonicGain.gain.setValueAtTime(volume * 0.25, time);
  harmonicGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
  osc.connect(gain);
  harmonic.connect(harmonicGain).connect(gain);
  gain.connect(master);
  gain.connect(delay);
  osc.start(time);
  harmonic.start(time);
  osc.stop(time + 1.5);
  harmonic.stop(time + 0.4);
}

function padChord(engine, freqs, time, duration) {
  const { ctx, master } = engine;
  for (const freq of freqs) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.028, time + duration * 0.35);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    osc.connect(gain).connect(master);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  }
}

function tensionPulse(engine, time, level) {
  const { ctx, master } = engine;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = NOTE_FREQ('A', 5);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.016 + level * 0.03, time + 0.2);
  gain.gain.linearRampToValueAtTime(0, time + BAR_SECONDS * 0.9);
  osc.connect(filter).connect(gain).connect(master);
  osc.start(time);
  osc.stop(time + BAR_SECONDS);
}

function scheduleBar(engine) {
  const chord = PROGRESSION[engine.bar % PROGRESSION.length];
  const start = engine.nextBarTime;
  padChord(engine, chord.pad.map((n) => NOTE_FREQ(n.slice(0, -1), Number(n.slice(-1)))), start, BAR_SECONDS * 1.05);
  chord.piano.forEach((n, i) => {
    pianoNote(engine, NOTE_FREQ(n.slice(0, -1), Number(n.slice(-1))), start + i * 0.06, 0.085);
  });
  const phrase = MELODY_LINE[engine.bar % MELODY_LINE.length];
  phrase.forEach((step, i) => {
    if (step < 0) return;
    const name = chord.melody[step % chord.melody.length];
    musicBoxNote(engine, NOTE_FREQ(name.slice(0, -1), Number(name.slice(-1))), start + i * (BAR_SECONDS / 4) + 0.05);
  });
  if (engine.tension > 0.25) tensionPulse(engine, start, engine.tension);
  engine.bar += 1;
  engine.nextBarTime += BAR_SECONDS;
}

export const music = {
  start() {
    if (engine || typeof window === 'undefined') return;
    engine = buildEngine();
    if (!engine) return;
    engine.nextBarTime = engine.ctx.currentTime + 0.1;
    scheduleBar(engine);
    engine.timer = window.setInterval(() => {
      while (engine.nextBarTime < engine.ctx.currentTime + BAR_SECONDS * 1.5) scheduleBar(engine);
    }, 400);
  },
  setTension(level) {
    if (engine) engine.tension = Math.max(0, Math.min(1, level));
  },
};
