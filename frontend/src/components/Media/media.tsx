import React, { useRef, useState, useEffect } from "react";
import "./VoiceCall.css";

/**
 * AI Speech Tutor - Conversational Voice Interface
 * A modern, immersive UI for voice-based tutoring sessions.
 */

type TutorState = "idle" | "listening" | "thinking" | "speaking";

const VoiceCall: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorMessage, setTutorMessage] = useState<string>("");
  const [tutorState, setTutorState] = useState<TutorState>("idle");

  const wsRef = useRef<WebSocket | null>(null);
  const playbackAudioContextRef = useRef<AudioContext | null>(null);
  const playbackNextTimeRef = useRef<number>(0);
  const captureAudioContextRef = useRef<AudioContext | null>(null);
  const captureSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const captureProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const captureWorkletRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const ensurePlaybackContext = async () => {
    if (!playbackAudioContextRef.current) {
      playbackAudioContextRef.current = new AudioContext();
      playbackNextTimeRef.current = 0;
    }

    const ctx = playbackAudioContextRef.current;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // ignore
      }
    }

    return ctx;
  };

  const pcm16ToFloat32 = (pcm: Int16Array) => {
    const out = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) out[i] = pcm[i] / 0x8000;
    return out;
  };

  const resampleLinear = (
    input: Float32Array,
    srcRate: number,
    dstRate: number
  ) => {
    if (srcRate === dstRate) return input;
    const ratio = dstRate / srcRate;
    const outLength = Math.max(1, Math.round(input.length * ratio));
    const out = new Float32Array(outLength);
    const step = srcRate / dstRate;
    for (let i = 0; i < outLength; i++) {
      const srcPos = i * step;
      const i0 = Math.floor(srcPos);
      const i1 = Math.min(i0 + 1, input.length - 1);
      const frac = srcPos - i0;
      out[i] = input[i0] * (1 - frac) + input[i1] * frac;
    }
    return out;
  };

  const connectCall = async () => {
    if (isConnected) return;
    setError(null);

    const wsUrl =
      (typeof window !== "undefined" &&
        window.location.hostname &&
        `ws://${window.location.hostname}:8000/ws/voice`) ||
      "ws://127.0.0.1:8000/ws/voice";

    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("Connected to backend");
      wsRef.current = ws;
      setIsConnected(true);
      setTutorMessage("Hi! I'm Grace. What would you like to learn today?");
      setTutorState("idle");
    };

    ws.onclose = (evt) => {
      console.log("WS closed", evt.code, evt.reason);
      setError("Connection lost. Let me try to reconnect...");
      cleanup();
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
      setError("Oops! Something went wrong. Please try again.");
      cleanup();
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        try {
          const msg = JSON.parse(event.data) as {
            type?: string;
            transcript?: string;
            answer?: string;
            citations?: Array<Record<string, unknown>>;
            error?: string;
            status?: string;
          };

          if (msg.type === "kb_result") {
            if (msg.error) setError(msg.error);

            if (msg.status === "processing") {
              setTutorState("thinking");
              setTutorMessage("Let me think about that...");
            }

            if (msg.status === "done" && typeof msg.answer === "string") {
              // We just update the text here. The state "speaking" is triggered by the binary audio data.
              // If there's no audio (text-only response), we might need to handle that,
              // but typically 'voice' endpoint sends audio.
              if (msg.answer) {
                setTutorMessage(msg.answer);
              }
            }
            return;
          }
        } catch {
          // fall through
        }
        return;
      }

      // Binary: audio playback
      const pcmArrayBuf = event.data as ArrayBuffer;
      setTutorState("speaking");

      const ctx = await ensurePlaybackContext();
      const inputRate = 24000;
      const pcm16 = new Int16Array(pcmArrayBuf);
      const float32 = pcm16ToFloat32(pcm16);
      const resampled = resampleLinear(float32, inputRate, ctx.sampleRate);

      const audioBuffer = ctx.createBuffer(1, resampled.length, ctx.sampleRate);
      audioBuffer.getChannelData(0).set(resampled);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const minLead = 0.05;
      const startAt = Math.max(playbackNextTimeRef.current, now + minLead);
      source.start(startAt);
      playbackNextTimeRef.current = startAt + audioBuffer.duration;
    };
  };

  // Monitor audio playback to determine when speaking ends
  useEffect(() => {
    let interval: number;

    if (tutorState === "speaking") {
      interval = window.setInterval(() => {
        const ctx = playbackAudioContextRef.current;
        // Check if we have a context and if we've passed the scheduled playback time
        // We add a small buffer (100ms) to ensure we don't cut off the very end or flicker on tight streams
        if (ctx && playbackNextTimeRef.current > 0) {
          if (ctx.currentTime > playbackNextTimeRef.current + 0.1) {
            setTutorState("idle");
          }
        }
      }, 100);
    }

    return () => clearInterval(interval);
  }, [tutorState]);

  const startSpeaking = () => {
    if (!isConnected || isSpeaking || !wsRef.current) {
      return;
    }

    const ws = wsRef.current;
    setError(null);
    setTutorState("listening");
    setTutorMessage("I'm listening...");

    (async () => {
      let stream = mediaStreamRef.current;
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
        } catch (e) {
          console.error("getUserMedia failed:", e);
          setError("Please allow microphone access to talk to Grace.");
          setTutorState("idle");
          return;
        }
      }

      const captureCtx = new AudioContext({ sampleRate: 24000 });
      captureAudioContextRef.current = captureCtx;

      const source = captureCtx.createMediaStreamSource(stream);
      captureSourceRef.current = source;

      if ("audioWorklet" in captureCtx) {
        try {
          await captureCtx.audioWorklet.addModule(
            new URL("../../worklets/pcm16-capture.worklet.ts", import.meta.url)
          );

          const worklet = new AudioWorkletNode(captureCtx, "pcm16-capture", {
            numberOfInputs: 1,
            numberOfOutputs: 0,
            channelCount: 1,
          });
          captureWorkletRef.current = worklet;

          worklet.port.onmessage = (evt: MessageEvent) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const data = evt.data as { type?: string; buffer?: ArrayBuffer };
            if (data?.type === "pcm16" && data.buffer) {
              ws.send(data.buffer);
            }
          };

          source.connect(worklet);
        } catch (e) {
          console.warn("AudioWorklet init failed, falling back:", e);
        }
      }

      if (!captureWorkletRef.current) {
        const processor = captureCtx.createScriptProcessor(4096, 1, 1);
        captureProcessorRef.current = processor;

        processor.onaudioprocess = (evt) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = evt.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          ws.send(pcm16.buffer);
        };

        source.connect(processor);
        processor.connect(captureCtx.destination);
      }

      setIsSpeaking(true);
    })();
  };

  const stopSpeaking = () => {
    if (!isSpeaking) return;

    setIsSpeaking(false);
    setTutorState("thinking");
    setTutorMessage("Hmm, let me think about that...");

    try {
      captureProcessorRef.current?.disconnect();
      captureSourceRef.current?.disconnect();
      captureWorkletRef.current?.disconnect();
    } catch {
      // ignore
    }
    captureProcessorRef.current = null;
    captureSourceRef.current = null;
    captureWorkletRef.current = null;

    captureAudioContextRef.current?.close();
    captureAudioContextRef.current = null;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(new ArrayBuffer(0));
    }
  };

  const cleanup = () => {
    try {
      captureProcessorRef.current?.disconnect();
      captureSourceRef.current?.disconnect();
      captureWorkletRef.current?.disconnect();
    } catch {
      // ignore
    }
    captureProcessorRef.current = null;
    captureSourceRef.current = null;
    captureWorkletRef.current = null;

    captureAudioContextRef.current?.close();
    captureAudioContextRef.current = null;

    wsRef.current?.close();
    wsRef.current = null;

    playbackAudioContextRef.current?.close();
    playbackAudioContextRef.current = null;
    playbackNextTimeRef.current = 0;

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    setIsSpeaking(false);
    setIsConnected(false);
    setTutorState("idle");
    setTutorMessage("");
  };

  const endCall = () => {
    cleanup();
  };

  const getStatusText = () => {
    switch (tutorState) {
      case "listening":
        return "Listening to you...";
      case "thinking":
        return "Thinking...";
      case "speaking":
        return "Speaking...";
      default:
        return "Ready to chat";
    }
  };

  const getVideoSource = () => {
    switch (tutorState) {
      case "speaking":
        return "/welcome-main.webm";
      default:
        return "/idle-main.webm";
    }
  };

  // Handle video source changes
  useEffect(() => {
    if (videoRef.current && isConnected) {
      const newSrc = getVideoSource();
      if (videoRef.current.src !== newSrc) {
        videoRef.current.src = newSrc;
        videoRef.current.play().catch(() => { });
      }
    }
  }, [tutorState, isConnected]);

  return (
    <div className="voice-tutor-container">
      {/* Error Toast */}
      {error && (
        <div className="error-toast">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Session Start Screen */}
      {!isConnected ? (
        <div className="session-start-screen">
          <div className="tutor-preview">
            <video
              src="/idle-main.webm"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
          <div className="session-start-content">
            <h1>Talk To Grace</h1>
            <p>Need clarification? Start a voice session and ask me anything!</p>
          </div>
          <button className="btn-start-session" onClick={connectCall}>
            <span className="icon">🎙️</span>
            Start Session
          </button>
        </div>
      ) : (
        /* Active Session */
        <div className="session-active">
          {/* Tutor Video */}
          <div className={`tutor-video-container ${tutorState}`}>
            <video
              ref={videoRef}
              className="tutor-video"
              src={getVideoSource()}
              autoPlay
              loop
              muted
              playsInline
            />
            {/* Thinking Bubble */}
            {tutorState === "thinking" && (
              <div className="thinking-bubble">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}
          </div>

          {/* Speech Bubble */}
          <div className="speech-bubble">
            <p>{tutorMessage || "What would you like to learn about?"}</p>
          </div>

          {/* Status Indicator */}
          <div className={`status-indicator ${tutorState}`}>
            <div className="status-dot"></div>
            <span>{getStatusText()}</span>
          </div>

          {/* Microphone Button */}
          <div className="mic-button-container">
            <button
              className={`mic-button ${isSpeaking ? "recording" : ""}`}
              onMouseDown={startSpeaking}
              onMouseUp={stopSpeaking}
              onMouseLeave={isSpeaking ? stopSpeaking : undefined}
              onTouchStart={startSpeaking}
              onTouchEnd={stopSpeaking}
              disabled={tutorState === "thinking" || tutorState === "speaking"}
            >
              {isSpeaking ? "🎤" : "🎙️"}
            </button>
            <p className="mic-hint">
              {tutorState === "thinking"
                ? "Wait for Grace..."
                : tutorState === "speaking"
                  ? "Grace is speaking..."
                  : "Hold to talk"}
            </p>
          </div>

          {/* End Session Button */}
          <button className="btn-end-session" onClick={endCall}>
            End Session
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceCall;
