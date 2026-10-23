export interface StudioMixOptions {
  studioVoice: boolean;
  drums: boolean;
  guitar: boolean;
  keyboard: boolean;
}

const MAX_STUDIO_DURATION_SECONDS = 300;

function createNoiseBuffer(context: OfflineAudioContext, duration: number): AudioBuffer {
  const frames = Math.max(1, Math.floor(context.sampleRate * duration));
  const impulse = context.createBuffer(2, frames, context.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
    const samples = impulse.getChannelData(channel);
    for (let i = 0; i < samples.length; i++) {
      samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 3);
    }
  }
  return impulse;
}

function scheduleTone(
  context: OfflineAudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  duration: number,
  waveform: OscillatorType,
  volume: number
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = waveform;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function scheduleDrum(
  context: OfflineAudioContext,
  destination: AudioNode,
  startTime: number,
  kind: 'kick' | 'snare' | 'hat'
): void {
  const duration = kind === 'kick' ? 0.24 : kind === 'snare' ? 0.16 : 0.06;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = kind === 'kick' ? 'sine' : 'triangle';
  oscillator.frequency.setValueAtTime(kind === 'kick' ? 130 : kind === 'snare' ? 190 : 8000, startTime);
  if (kind === 'kick') oscillator.frequency.exponentialRampToValueAtTime(42, startTime + duration);
  gain.gain.setValueAtTime(kind === 'hat' ? 0.04 : 0.14, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.01);
}

function addInstruments(
  context: OfflineAudioContext,
  destination: AudioNode,
  duration: number,
  options: StudioMixOptions
): void {
  const beat = 60 / 86;
  const chords = [
    [261.63, 329.63, 392],
    [196, 246.94, 293.66],
    [220, 261.63, 329.63],
    [174.61, 220, 261.63],
  ];
  const totalBeats = Math.ceil(duration / beat);

  for (let index = 0; index < totalBeats; index++) {
    const time = index * beat;
    const chord = chords[Math.floor(index / 4) % chords.length];

    if (options.keyboard && index % 4 === 0) {
      chord.forEach((note) => scheduleTone(context, destination, note, time, beat * 3.5, 'triangle', 0.045));
    }

    if (options.guitar && index % 2 === 0) {
      chord.forEach((note) => scheduleTone(context, destination, note * 2, time, 0.32, 'sawtooth', 0.016));
    }

    if (options.drums) {
      scheduleDrum(context, destination, time, index % 4 === 0 || index % 4 === 2 ? 'kick' : 'hat');
      if (index % 4 === 1 || index % 4 === 3) {
        scheduleDrum(context, destination, time, 'snare');
      }
    }
  }
}

function encodeWav(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels;
  const sampleCount = buffer.length * channels;
  const dataSize = sampleCount * 2;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channelData = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel));
  for (let frame = 0; frame < buffer.length; frame++) {
    for (let channel = 0; channel < channels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export async function createStudioMix(
  audioBlob: Blob,
  options: StudioMixOptions
): Promise<Blob> {
  if (typeof AudioContext === 'undefined' || typeof OfflineAudioContext === 'undefined') {
    throw new Error('Studio audio processing is not supported by this browser.');
  }

  const decoder = new AudioContext();
  try {
    const decoded = await decoder.decodeAudioData(await audioBlob.arrayBuffer());
    if (decoded.duration > MAX_STUDIO_DURATION_SECONDS) {
      throw new Error('Studio processing is limited to recordings of five minutes or less.');
    }

    const sampleRate = Math.min(decoded.sampleRate, 32000);
    const outputFrames = Math.ceil((decoded.duration + 0.8) * sampleRate);
    const context = new OfflineAudioContext(2, outputFrames, sampleRate);
    const source = context.createBufferSource();
    source.buffer = decoded;

    const highPass = context.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 75;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = options.studioVoice ? 3.2 : 1.3;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.22;

    const master = context.createGain();
    master.gain.value = options.drums || options.guitar || options.keyboard ? 0.72 : 0.95;
    highPass.connect(compressor);
    compressor.connect(master);

    if (options.studioVoice) {
      const reverb = context.createConvolver();
      const wet = context.createGain();
      reverb.buffer = createNoiseBuffer(context, 1.1);
      wet.gain.value = 0.18;
      compressor.connect(reverb);
      reverb.connect(wet);
      wet.connect(master);
    }

    if (options.drums || options.guitar || options.keyboard) {
      addInstruments(context, master, decoded.duration, options);
    }

    master.connect(context.destination);
    source.connect(highPass);
    source.start(0);

    return encodeWav(await context.startRendering());
  } finally {
    await decoder.close();
  }
}
