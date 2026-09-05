from flask import Flask, request, Response
import subprocess
from pathlib import Path
app = Flask(__name__)


BASE = Path(__file__).resolve().parent
MODEL = BASE / "voices" / "id_ID-news_tts-medium.onnx"
FFMPEG = r"C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\ffmpeg.exe"

@app.route("/tts", methods=["POST"])
def tts():
    data = request.get_json()
    text = data["text"]

    
    result = subprocess.run([
        "piper",
        "--model", str(MODEL),
        "--output-raw"
    ], input=text.encode(), capture_output=True)

    print("return code:", result.returncode)
    print("stdout:", len(result.stdout))
    print("stderr:", result.stderr.decode())

    if result.returncode != 0:
        return Response(
            result.stderr,
            status=500,
            mimetype="text/plain"
        )

    pcm = result.stdout

    if len(pcm) % 2:
        pcm = pcm[:-1]

    ogg = subprocess.run(
        [
            FFMPEG,
            "-f", "s16le",
            "-ar", "22050",
            "-ac", "1",
            "-i", "pipe:0",
            "-c:a", "libopus",
            "-b:a", "64k",
            "-f", "ogg",
            "pipe:1"
        ],
        input=pcm,
        capture_output=True
    )

    print("ffmpeg return code:", ogg.returncode)
    print("ogg size:", len(ogg.stdout))
    print("ffmpeg stderr:", ogg.stderr.decode())

    if ogg.returncode != 0:
        return Response(
            ogg.stderr,
            status=500,
            mimetype="text/plain"
        )

    return Response(
        ogg.stdout,
        mimetype="audio/ogg"
    )
app.run(host="127.0.0.1", port=5000)

