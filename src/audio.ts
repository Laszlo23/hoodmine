import type { Tier } from "./world.ts";

let ctx: AudioContext | null = null;

function tone(freq: number, end: number, dur: number, type: OscillatorType) {
  const AC = window.AudioContext;
  ctx ??= new AC();
  void ctx.resume();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, end), now + dur);
  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

function noise(dur: number) {
  const AC = window.AudioContext;
  ctx ??= new AC();
  void ctx.resume();
  const now = ctx.currentTime;
  const length = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(280, now);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.buffer = buffer;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(now);
}

export function miss() {
  try {
    noise(0.22);
    tone(146, 48, 0.46, "sawtooth");
    window.setTimeout(() => tone(98, 36, 0.5, "square"), 50);
    window.setTimeout(() => tone(73, 40, 0.34, "sawtooth"), 120);
    navigator.vibrate?.([50, 30, 120]);
  } catch {
    ctx = null;
  }
}

export function sting(tier: Tier) {
  try {
    switch (tier) {
      case "soft":
        tone(180, 70, 0.16, "square");
        break;
      case "hit":
        tone(392, 280, 0.1, "triangle");
        window.setTimeout(() => tone(523, 420, 0.12, "sine"), 60);
        window.setTimeout(() => tone(1046, 880, 0.18, "sine"), 130);
        navigator.vibrate?.(16);
        break;
      case "jackpot":
        tone(523, 420, 0.14, "triangle");
        window.setTimeout(() => tone(659, 540, 0.16, "sine"), 70);
        window.setTimeout(() => tone(784, 660, 0.22, "sine"), 150);
        window.setTimeout(() => tone(1174, 980, 0.28, "sine"), 240);
        navigator.vibrate?.([18, 36, 28]);
        break;
      case "break":
        tone(96, 42, 0.2, "square");
        navigator.vibrate?.(40);
        break;
      default: {
        const _never: never = tier;
        return _never;
      }
    }
  } catch {
    ctx = null;
  }
}
