/* eslint-disable no-undef */
// AudioWorkletProcessor runs in the AudioWorkletGlobalScope (not the window).

type Pcm16Message = {
  type: "pcm16";
  buffer: ArrayBuffer;
};

class Pcm16CaptureProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    // Mono: take channel 0.
    const ch0 = input[0];
    if (!ch0) return true;

    const pcm16 = new Int16Array(ch0.length);
    for (let i = 0; i < ch0.length; i++) {
      const s = Math.max(-1, Math.min(1, ch0[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const msg: Pcm16Message = { type: "pcm16", buffer: pcm16.buffer };
    // Transfer buffer for performance.
    this.port.postMessage(msg, [pcm16.buffer]);
    return true;
  }
}

registerProcessor("pcm16-capture", Pcm16CaptureProcessor);


