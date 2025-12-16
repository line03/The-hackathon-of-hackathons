import os
import io
import wave
import asyncio
import json
import base64
import datetime
from uuid import uuid4
from typing import Any
from dotenv import load_dotenv, find_dotenv
import websockets
from openai import OpenAI
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketState

# Load .env reliably regardless of current working directory (root vs backend/).
load_dotenv(find_dotenv(usecwd=True))

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
VECTOR_STORE_ID = os.environ.get("VECTOR_STORE_ID")

# Models (override in .env if needed)
REALTIME_MODEL = os.environ.get("OPENAI_REALTIME_MODEL", "gpt-4o-realtime-preview")
STT_MODEL = os.environ.get("OPENAI_STT_MODEL", "gpt-4o-mini-transcribe")
RAG_MODEL = os.environ.get("OPENAI_RAG_MODEL", "gpt-5.1-mini")
RAG_ASSISTANT_MODEL = os.environ.get("OPENAI_RAG_ASSISTANT_MODEL", "gpt-4o-mini")
TTS_VOICE = os.environ.get("OPENAI_TTS_VOICE", "alloy")

SAMPLE_RATE_HZ = 24000

app = FastAPI()

# for local dev, allow your React origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY missing in .env")
if not VECTOR_STORE_ID:
    raise RuntimeError("VECTOR_STORE_ID missing in .env (create/upload KB vector store first)")

client = OpenAI(api_key=OPENAI_API_KEY)
_kb_assistant_id: str | None = os.environ.get("KB_ASSISTANT_ID")


def _safe_json_dumps(obj: Any) -> str:
    """
    JSON-dump helper that won't crash on unexpected types from SDK objects.
    """
    return json.dumps(obj, ensure_ascii=False, default=str)


def _wav_bytes_from_pcm16(pcm16_bytes: bytes) -> io.BytesIO:
    """
    Wrap raw PCM16 mono audio into a WAV container for STT.
    """
    buff = io.BytesIO()
    with wave.open(buff, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(SAMPLE_RATE_HZ)
        wf.writeframes(pcm16_bytes)
    buff.seek(0)
    # OpenAI SDK expects a file-like with a name attribute.
    buff.name = "audio.wav"  # type: ignore[attr-defined]
    return buff


def transcribe_turn(pcm16_bytes: bytes) -> str:
    """
    Transcribe a single user turn from PCM16 audio -> text.
    """
    wav_file = _wav_bytes_from_pcm16(pcm16_bytes)
    # The SDK supports multiple STT models; use env-configured model.
    result = client.audio.transcriptions.create(
        model=STT_MODEL,
        file=wav_file,
    )
    # `result.text` is common across STT responses.
    return (getattr(result, "text", "") or "").strip()


def kb_only_answer_with_citations(question: str) -> dict[str, Any]:
    """
    KB-only answer using file_search against the configured vector store.
    Returns {answer: str, citations: list}.
    """
    global _kb_assistant_id

    # Use Assistants API because this OpenAI SDK version (2.9.0) doesn't accept
    # `tool_resources` on responses.create(). Assistants/Threads does support it.
    if not _kb_assistant_id:
        assistant = client.beta.assistants.create(
            name="KB Voice Assistant",
            instructions=(
                "You are a friendly voice assistant for children learning about anti-corruption. "
                "ONLY answer using information from the attached files (file_search). "
                "Keep answers SHORT (2-3 sentences max), SIMPLE (easy words), and CLEAR. "
                "Explain like you're talking to a 15-year-old. "
                "Always respond in English. "
                "If the topic isn't covered, say: 'I don't have information about that in my knowledge base.'"
            ),
            model=RAG_ASSISTANT_MODEL,
            tools=[{"type": "file_search"}],
            tool_resources={"file_search": {"vector_store_ids": [VECTOR_STORE_ID]}},
        )
        _kb_assistant_id = assistant.id

    thread = client.beta.threads.create()
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=question,
    )

    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=_kb_assistant_id,
    )

    # Poll until run completes
    import time

    max_wait_seconds = 60
    waited = 0
    while run.status in ("queued", "in_progress") and waited < max_wait_seconds:
        time.sleep(1.5)
        waited += 1.5
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

    if run.status != "completed":
        detail = (
            run.last_error.message
            if getattr(run, "last_error", None)
            else f"Assistant run status: {run.status}"
        )
        raise RuntimeError(detail)

    messages = client.beta.threads.messages.list(thread_id=thread.id)
    assistant_message = next((m for m in messages.data if m.role == "assistant"), None)
    if not assistant_message:
        return {"answer": "", "citations": []}

    # Extract answer and citations (best-effort).
    answer_text = ""
    citations: list[dict[str, Any]] = []

    for part in assistant_message.content:
        # Most assistant outputs are text parts
        if getattr(part, "type", None) == "text":
            text_obj = getattr(part, "text", None)
            if text_obj and getattr(text_obj, "value", None):
                answer_text += (text_obj.value or "")

            for ann in getattr(text_obj, "annotations", []) or []:
                raw = ann if isinstance(ann, dict) else getattr(ann, "__dict__", {"annotation": str(ann)})
                try:
                    citations.append(json.loads(_safe_json_dumps(raw)))
                except Exception:
                    citations.append({"citation": str(raw)})

    return {"answer": answer_text.strip(), "citations": citations}


async def transcribe_turn_async(pcm16_bytes: bytes) -> str:
    # OpenAI Python SDK calls are synchronous; run in a worker thread so we don't block the WS event loop.
    return await asyncio.to_thread(transcribe_turn, pcm16_bytes)


async def kb_only_answer_with_citations_async(question: str) -> dict[str, Any]:
    # OpenAI Python SDK calls are synchronous; run in a worker thread so we don't block the WS event loop.
    return await asyncio.to_thread(kb_only_answer_with_citations, question)


async def speak_text_via_realtime(browser_ws: WebSocket, text: str):
    """
    Use OpenAI Realtime as a TTS engine:
    - send text
    - stream response.audio.delta PCM16 bytes to the browser websocket
    """
    url = f"wss://api.openai.com/v1/realtime?model={REALTIME_MODEL}"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "OpenAI-Beta": "realtime=v1",
    }

    print(f"[TTS] Connecting to OpenAI Realtime (model={REALTIME_MODEL})...")
    # websockets v15 uses `additional_headers` (NOT `extra_headers`).
    openai_ws = await websockets.connect(url, additional_headers=headers)
    print("[TTS] Connected to OpenAI Realtime")

    # Configure the session for audio output; we do NOT send audio input here.
    session_update = {
        "type": "session.update",
        "session": {
            "modalities": ["audio", "text"],
            "output_audio_format": "pcm16",
            "voice": TTS_VOICE,
            "instructions": (
                "You are a friendly voice assistant for young adults. "
                "Speak in English with a warm, encouraging tone. "
                "Read the provided text aloud exactly as written. "
                "Do not add extra words or translate."
            ),
        },
    }
    print("[TTS] Sending session.update...")
    await openai_ws.send(json.dumps(session_update))

    # Provide the text as a user message; the model will respond with audio.
    print(f"[TTS] Sending text to speak: '{text[:50]}...'")
    await openai_ws.send(
        json.dumps(
            {
                "type": "conversation.item.create",
                "item": {
                    "type": "message",
                    "role": "user",
                    "content": [{"type": "input_text", "text": text}],
                },
            }
        )
    )
    await openai_ws.send(json.dumps({"type": "response.create"}))
    print("[TTS] Sent response.create, waiting for audio...")

    try:
        async for message in openai_ws:
            if isinstance(message, bytes):
                # Rare, but forward if received.
                print(f"[TTS] Received binary message ({len(message)} bytes)")
                await browser_ws.send_bytes(message)
                continue

            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                print(f"[TTS] Failed to parse JSON: {message[:100]}")
                continue

            msg_type = data.get("type")
            print(f"[TTS] Received message type: {msg_type}")

            if msg_type == "error":
                print(f"[TTS] ERROR from OpenAI: {data}")
            elif msg_type == "response.audio.delta":
                audio_b64 = data.get("delta")
                if audio_b64:
                    audio_bytes = base64.b64decode(audio_b64)
                    await browser_ws.send_bytes(audio_bytes)
            elif msg_type == "response.done" or msg_type == "response.completed":
                print("[TTS] Response completed")
                break
    except Exception as e:
        print(f"[TTS] Exception during message loop: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("[TTS] Closing OpenAI Realtime connection")
        try:
            await openai_ws.close()
        except Exception:
            pass


@app.websocket("/ws/voice")
async def voice_bridge(ws: WebSocket):
    """
    Bridge between:
    - Browser WebSocket (audio in/out)
    - OpenAI Realtime WebSocket (audio in/out + events)

    This is a simplified bridge intended for hackathon prototyping.
    For production, follow OpenAI's latest Realtime docs closely.
    """
    await ws.accept()
    print("[WS] Connection accepted")

    # Greet on connect (spoken)
    try:
        print("[WS] Starting greeting TTS...")
        await speak_text_via_realtime(ws, "Hi! How can I help you today?")
        print("[WS] Greeting TTS completed")
    except Exception as e:
        print("[WS] Greeting TTS failed:", e)

    # Per-turn audio buffer (PCM16)
    audio_chunks: list[bytes] = []
    chunk_count = 0

    print("[WS] Entering receive loop...")
    try:
        while True:
            try:
                # Use receive() directly instead of iter_bytes() to see all messages including 0-length
                message = await ws.receive()
                msg_type = message.get("type")
                print(f"[WS] Received message type={msg_type}")

                if msg_type == "websocket.disconnect":
                    print("[WS] Client disconnected")
                    break

                if msg_type != "websocket.receive":
                    continue

                chunk = message.get("bytes")
                if chunk is None:
                    # Text message - ignore
                    text_data = message.get("text")
                    print(f"[WS] Received text message (ignoring): {text_data}")
                    continue

                chunk_count += 1
                print(f"[WS] Received binary chunk #{chunk_count}, len={len(chunk)}")

                # Stop Speaking marker: run STT -> KB answer -> speak answer
                if len(chunk) == 0:
                    print("[WS] Zero-length chunk received - processing turn")
                    pcm16_bytes = b"".join(audio_chunks)
                    audio_chunks = []

                    if not pcm16_bytes:
                        print("[WS] No audio buffered, skipping turn")
                        continue

                    turn_id = uuid4().hex[:8]
                    timestamp = datetime.datetime.utcnow().isoformat()

                    # Let the UI know we're working so it doesn't feel stuck.
                    try:
                        await ws.send_text(_safe_json_dumps({"type": "kb_result", "status": "processing"}))
                    except Exception:
                        pass

                    # STT
                    try:
                        print(f"[{turn_id}] {timestamp} - starting STT ({len(pcm16_bytes)} bytes)")
                        transcript = await transcribe_turn_async(pcm16_bytes)
                        print(f"[{turn_id}] {timestamp} - STT done: '{transcript[:100]}...' (len {len(transcript)})")
                    except Exception as e:
                        print(f"[{turn_id}] STT error:", e)
                        try:
                            await ws.send_text(_safe_json_dumps({"type": "kb_result", "error": f"STT failed: {e}"}))
                        except Exception:
                            pass
                        continue

                    # Send transcript to frontend
                    try:
                        await ws.send_text(_safe_json_dumps({"type": "kb_result", "transcript": transcript}))
                    except Exception as e:
                        print("Failed sending transcript to client:", e)

                    if not transcript:
                        print(f"[{turn_id}] Empty transcript, skipping KB query")
                        continue

                    # RAG / KB query
                    try:
                        print(f"[{turn_id}] {timestamp} - querying KB")
                        rag = await kb_only_answer_with_citations_async(transcript)
                        answer_text = rag.get("answer", "")
                        citations = rag.get("citations", [])
                        print(f"[{turn_id}] {timestamp} - KB answer ready ({len(answer_text)} chars)")
                    except Exception as e:
                        print(f"[{turn_id}] RAG error:", e)
                        try:
                            await ws.send_text(_safe_json_dumps({"type": "kb_result", "error": f"RAG failed: {e}"}))
                        except Exception:
                            pass
                        continue

                    # Send answer + citations to frontend (text)
                    try:
                        await ws.send_text(
                            _safe_json_dumps(
                                {
                                    "type": "kb_result",
                                    "answer": answer_text,
                                    "citations": citations,
                                    "status": "done",
                                }
                            )
                        )
                    except Exception as e:
                        print("Failed sending answer/citations to client:", e)

                    # Speak the answer
                    try:
                        print(f"[{turn_id}] {timestamp} - speaking answer")
                        await speak_text_via_realtime(
                            ws,
                            answer_text or "I don't know based on the current knowledge base.",
                        )
                        print(f"[{turn_id}] {timestamp} - speak complete")
                    except Exception as e:
                        print(f"[{turn_id}] TTS error:", e)

                    continue

                # Normal audio chunk - buffer it
                audio_chunks.append(chunk)

            except Exception as loop_err:
                # Don't kill the WS on unexpected processing errors; report and continue.
                print("[WS] voice_loop error:", loop_err)
                import traceback
                traceback.print_exc()
                try:
                    await ws.send_text(_safe_json_dumps({"type": "kb_result", "error": f"Server error: {loop_err}"}))
                except Exception:
                    pass

    except WebSocketDisconnect:
        print("[WS] WebSocketDisconnect exception")
    except Exception as outer_err:
        print("[WS] Outer exception:", outer_err)
        import traceback
        traceback.print_exc()
    finally:
        print("[WS] Cleaning up connection")
        try:
            if ws.application_state != WebSocketState.DISCONNECTED:
                await ws.close()
        except RuntimeError:
            pass
