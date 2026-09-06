# ZARVIS
## Tech Stack

<p>
  <img src="https://cdn.simpleicons.org/node.js" width="40">
  <img src="https://cdn.simpleicons.org/javascript" width="40">
  <img src="https://www.python.org/static/community_logos/python-logo-generic.svg" width="120" alt="Python">
</p>

**ZARVIS** is a local AI personal assistant built with a modular architecture using **Node.js, Python, and a local LLM**.

Its voice pipeline allows ZARVIS to listen to speech through a microphone, process the input with speech recognition and a local language model, then convert the generated response back into speech.

### Voice Pipeline

```text
Microphone
    ↓
Speech-to-Text (Whisper)
    ↓
Core (Node.js)
    ↓
Local LLM
    ↓
Text-to-Speech (Piper)
    ↓
Audio Buffer
    ↓
FFPLAY
    ↓
Speaker
```

The project is designed around separate services, with **Node.js acting as the core/orchestrator** and **Python handling voice-related processing**.

ZARVIS is currently BETA as a long-term personal assistant project exploring local AI, voice interaction, automation, and hardware integration.
