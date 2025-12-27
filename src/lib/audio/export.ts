export type Effects = { radio: boolean; echo: boolean; crystal: boolean };

export async function applyOfflineEffects(input: AudioBuffer, effects: Effects): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(input.numberOfChannels, input.length, input.sampleRate);

  const src = ctx.createBufferSource();
  src.buffer = input;

  let node: AudioNode = src;

  if (effects.radio) {
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200;

    const ws = ctx.createWaveShaper();
    ws.curve = makeDistortionCurve(18);
    ws.oversample = "4x";

    node.connect(hp);
    hp.connect(ws);
    node = ws;
  }

  if (effects.crystal) {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -26;
    comp.knee.value = 18;
    comp.ratio.value = 3.2;
    comp.attack.value = 0.004;
    comp.release.value = 0.15;

    const shelf = ctx.createBiquadFilter();
    shelf.type = "highshelf";
    shelf.frequency.value = 3200;
    shelf.gain.value = 5.5;

    node.connect(comp);
    comp.connect(shelf);
    node = shelf;
  }

  if (effects.echo) {
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.22;

    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;

    const wet = ctx.createGain();
    wet.gain.value = 0.35;

    // feedback loop
    delay.connect(feedback);
    feedback.connect(delay);

    node.connect(delay);
    delay.connect(wet);

    const mix = ctx.createGain();
    mix.gain.value = 1;

    node.connect(mix);
    wet.connect(mix);
    node = mix;
  }

  node.connect(ctx.destination);
  src.start(0);

  return await ctx.startRendering();
}

function makeDistortionCurve(amount: number) {
  const n = 44100;
  const curve = new Float32Array(n);
  const k = typeof amount === "number" ? amount : 50;
  const deg = Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

// MP3 encoding via lamejs
export async function encodeMp3FromAudioBuffer(buffer: AudioBuffer, kbps: 128 | 160 | 192 = 192): Promise<Blob> {
  // lamejs has no TS types in many setups
  const lamejs = await import("lamejs");

  const mp3Encoder = new (lamejs as any).Mp3Encoder(2, buffer.sampleRate, kbps);

  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;

  const blockSize = 1152;
  const mp3Data: Uint8Array[] = [];

  for (let i = 0; i < left.length; i += blockSize) {
    const l = floatTo16BitPCM(left.subarray(i, i + blockSize));
    const r = floatTo16BitPCM(right.subarray(i, i + blockSize));
    const mp3buf = mp3Encoder.encodeBuffer(l, r);
    if (mp3buf.length > 0) mp3Data.push(new Uint8Array(mp3buf));
  }

  const end = mp3Encoder.flush();
  if (end.length > 0) mp3Data.push(new Uint8Array(end));

  return new Blob(mp3Data as unknown as BlobPart[], { type: "audio/mpeg" });
}

function floatTo16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}
