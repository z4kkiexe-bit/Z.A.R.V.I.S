import "../Whatsapp/Whatsapp.js"
import express from "express"
import { spawn } from "child_process" 
import "dotenv/config"


const app = express()
let resSTT;
const FFPLAY = "C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffplay.exe"
async function coreHamdler() {
    app.use(express.json())
    app.post("/stt", async (req, res) => {
        resSTT = req.body.text
        //const resAudConvert = await extrAudio(resSTT)
        //await playAudio(resAudConvert)
        console.log(resSTT)
        sttToAi()
        console.log("AI Prepare...")
        res.sendStatus(200)
        console.log("SUCCESS...")
    })
}
coreHamdler()

app.listen(3000, () => {
    console.log("ZARVIS server running on port 3000...")
})




// AI activation cmds >> .\llama-server.exe -m "C:\Users\User\Desktop\ZARVIS\LLM\LLM Models\qwen2.5-1.5b-instruct-q4_k_m.gguf" --host 127.0.0.1 --port 8081
export async function Fetching(input) {
    const fetchVal = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization":`Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type":"Application/json"
        },
        body:JSON.stringify({
            model: "openrouter/free",
            messages: [
                {
                    role: "system",
                    content: process.env.AI_SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: input 
                }
            ]
        })
    })
    console.log(process.env.OPENROUTER_API_KEY ? "API KEY KEBACA" : "API KEY TIDAK KEBAACA")
    const response = await fetchVal.json()
    console.log("STATUS:", fetchVal.status)
    console.log("OK:", fetchVal.ok)


    return response.choices?.[0]?.message?.content
}
Fetching("Hallo ai")


export async function extrAudio(input) {
    const objjson = {
        text: input
    }
    const res =  await fetch("http://127.0.0.1:5000/tts", {
        method: "POST",
        headers: {
            "Content-Type":"Application/json"
        },
        body: JSON.stringify(objjson)
    })
    console.log("JSON dikirim...")

    const arrBuffer = await res.arrayBuffer()
    const bufferOut = Buffer.from(arrBuffer)

    return bufferOut
}



export function playAudio(buffer) {
    return new Promise((resolve, reject) => {
        const player = spawn(FFPLAY, [
            "-nodisp",
            "-autoexit",
            "-i",
            "pipe:0"
        ])

        player.stderr.on("data", (data) => {
            console.log("FFPLAY:", data.toString())
        })

        player.on("error", reject)
        player.stdin.on("error", reject)
        player.stdin.end(buffer)

        player.on("close", (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error(`ffplay exited with code:${code}` ))
            }
        })

    })
}

async function sttToAi() {
    const sttInputAi = await Fetching(resSTT)
    
    const sttOutputAi = await extrAudio(sttInputAi)
    await playAudio(sttOutputAi)
}
