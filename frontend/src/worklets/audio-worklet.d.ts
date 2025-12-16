// Minimal type declarations for AudioWorklet global scope.
// TypeScript's DOM lib doesn't always include these in all configurations.

declare abstract class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: unknown);
  abstract process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}

declare function registerProcessor(
  name: string,
  processorCtor: (new (options?: unknown) => AudioWorkletProcessor) & {
    prototype: AudioWorkletProcessor;
  }
): void;


