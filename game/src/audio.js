'use strict';
/* Terumbu Karang — Cari Perbedaannya.
   Sound effects: one job, tiny WebAudio synth.
   No audio files: every blip is an oscillator, made on the spot.
   Audio starts only after a real user gesture (browser rule). */

let audioCtx = null;

function ensureAudio() {
  if (audioCtx) return audioCtx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  } catch (e) {
    audioCtx = null;
  }
  return audioCtx;
}

/* One short tone: frequency slides from `from` to `to` over `dur` seconds. */
function blip(from, to, dur, type, gain) {
  const ctx = ensureAudio();
  if (!ctx || ctx.state === 'suspended') return;
  try {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), ctx.currentTime + dur);
    amp.gain.setValueAtTime(gain || 0.12, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  } catch (e) {
    /* Sound is decoration: a failure here never breaks the game. */
  }
}

/* A found difference: happy two-note pop. */
function sfxFound() {
  blip(660, 990, 0.12, 'sine', 0.14);
  setTimeout(function () { blip(880, 1320, 0.14, 'sine', 0.12); }, 70);
}

/* A wrong click: low dull buzz. */
function sfxWrong() {
  blip(180, 110, 0.18, 'square', 0.06);
}

/* A hint spent: soft chime. */
function sfxHint() {
  blip(520, 780, 0.2, 'triangle', 0.1);
}

/* A scene cleared: little rising arpeggio. */
function sfxSceneClear() {
  const notes = [523, 659, 784, 1047];
  notes.forEach(function (f, i) {
    setTimeout(function () { blip(f, f * 1.01, 0.16, 'sine', 0.12); }, i * 90);
  });
}

/* Time ran out: falling notes. */
function sfxTimeout() {
  blip(392, 196, 0.5, 'sawtooth', 0.05);
}
