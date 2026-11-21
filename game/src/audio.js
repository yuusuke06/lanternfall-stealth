// All sound is synthesised with WebAudio: no audio files, nothing to
// load. Footsteps are short filtered noise taps whose loudness follows
// distance, so a guard you cannot see can still be heard coming.

let context = null;

function audioContext() {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    context = new AudioCtor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone({ frequency, endFrequency = null, duration = 0.12, type = 'sine', volume = 0.12, delay = 0 }) {
  const ctx = audioContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (endFrequency) osc.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noiseTap({ duration = 0.05, volume = 0.1, frequency = 900, delay = 0 }) {
  const ctx = audioContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(start);
}

export const sound = {
  unlock() { audioContext(); },
  playerStep(running) { noiseTap({ volume: running ? 0.10 : 0.045, frequency: running ? 700 : 520 }); },
  guardStep(distance) {
    const closeness = Math.max(0, 1 - distance / 320);
    if (closeness <= 0) return;
    noiseTap({ volume: 0.02 + closeness * 0.10, frequency: 340 });
  },
  coin() {
    tone({ frequency: 1560, duration: 0.07, type: 'triangle', volume: 0.16 });
    tone({ frequency: 2090, duration: 0.12, type: 'triangle', volume: 0.12, delay: 0.05 });
  },
  relic() {
    tone({ frequency: 880, duration: 0.10, type: 'sine', volume: 0.14 });
    tone({ frequency: 1320, duration: 0.16, type: 'sine', volume: 0.12, delay: 0.07 });
  },
  suspicious() { tone({ frequency: 520, endFrequency: 660, duration: 0.12, type: 'square', volume: 0.05 }); },
  alarm() {
    tone({ frequency: 740, endFrequency: 980, duration: 0.16, type: 'square', volume: 0.10 });
    tone({ frequency: 740, endFrequency: 980, duration: 0.16, type: 'square', volume: 0.10, delay: 0.18 });
  },
  caught() {
    tone({ frequency: 320, endFrequency: 90, duration: 0.5, type: 'sawtooth', volume: 0.16 });
  },
  exitOpen() {
    tone({ frequency: 523, duration: 0.12, volume: 0.12 });
    tone({ frequency: 659, duration: 0.12, volume: 0.12, delay: 0.1 });
    tone({ frequency: 784, duration: 0.22, volume: 0.12, delay: 0.2 });
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone({ frequency: f, duration: 0.2, volume: 0.12, delay: i * 0.11 }));
  },
};
