type SoundType = "correct" | "wrong" | "levelup" | "click" | "combo";

let audioCtx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted(): boolean {
  return muted;
}

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported or blocked — silent fallback
  }
}

export function playSound(type: SoundType) {
  if (muted) return;
  switch (type) {
    case "correct":
      // Upward two-note chime
      playTone(523, 0.12, "sine", 0.12);
      setTimeout(() => playTone(659, 0.15, "sine", 0.12), 100);
      break;
    case "wrong":
      // Low buzz
      playTone(200, 0.2, "square", 0.08);
      setTimeout(() => playTone(180, 0.25, "square", 0.08), 150);
      break;
    case "levelup":
      // Ascending arpeggio
      [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.15, "sine", 0.1), i * 100);
      });
      break;
    case "click":
      playTone(800, 0.05, "sine", 0.06);
      break;
    case "combo":
      // Rapid triple beep
      [600, 750, 900].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.08, "triangle", 0.08), i * 60);
      });
      break;
  }
}
