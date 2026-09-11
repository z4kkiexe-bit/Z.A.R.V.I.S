import sounddevice as sd
import keyboard
import requests
from flask import Flask, jsonify
from faster_whisper import WhisperModel


app = Flask(__name__)

print("Loading Whisper model...")

model = WhisperModel(
    "medium",
    device="cpu",
    compute_type="int8"
)

print("Whisper model loaded...")

def runSTT():

    sample_rate = 16000
    duration = 5

    print("Tekan f8 untuk merekam...")
    keyboard.wait("f8")

    print("Merekam...")

    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype="float32"
    )

    sd.wait()
    print("Audio max:", audio.max())
    print("Audio min:", audio.min())

    audio = audio.flatten()


    print("Selesai merekam.")


    print("Memproses dengan Whisper...")

    segments, info = model.transcribe(
        audio,
        language="id"
    )

    text = "".join(
        segment.text for segment in segments
    ).strip()

    print("Hasil:", text)

    return text


while True:
    valueWhisper = runSTT()

    requests.post(
        "http://192.168.1.8:3000/stt",
        json={
            "text": valueWhisper
        }
    )
