export const getAudioContext = (() => {
  let audioCtx: AudioContext | null = null;
  return () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };
})();

function playClack(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'square';
  // Fast frequency drop for a woody/plastic impact sound
  osc.frequency.setValueAtTime(250, time);
  osc.frequency.exponentialRampToValueAtTime(50, time + 0.04);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, time);
  filter.frequency.exponentialRampToValueAtTime(200, time + 0.04);

  // Sharp attack and quick decay
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.8, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.04);
}

export function playDiceRoll() {
  const ctx = getAudioContext();
  const clackCount = 15;
  const duration = 1.8; // seconds
  
  for (let i = 0; i < clackCount; i++) {
    // Randomly distribute the clacks, slightly denser at the beginning
    const time = ctx.currentTime + Math.pow(Math.random(), 1.5) * duration;
    playClack(ctx, time);
  }
}

function playTick(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1000, time);
  osc.frequency.exponentialRampToValueAtTime(200, time + 0.03);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.4, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 0.03);
}

export function playWheelSpin(durationMs: number) {
  const ctx = getAudioContext();
  const totalTime = durationMs / 1000;
  
  let currentTime = 0;
  let interval = 0.02; // Start very fast (20ms between ticks)
  
  while (currentTime < totalTime) {
    playTick(ctx, ctx.currentTime + currentTime);
    interval *= 1.065; // Decelerate over time
    currentTime += interval;
  }
}

export function playWinSound() {
  const ctx = getAudioContext();
  const time = ctx.currentTime;
  
  // Happy major chord arpeggio (C5, E5, G5, C6)
  const notes = [523.25, 659.25, 783.99, 1046.50];
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time + i * 0.1);
    
    gain.gain.setValueAtTime(0, time + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.4, time + i * 0.1 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.1 + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time + i * 0.1);
    osc.stop(time + i * 0.1 + 0.5);
  });
}
