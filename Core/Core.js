
import express from "express"
import { spawn } from "child_process" 
import "dotenv/config"
import "../Whatsapp/Whatsapp.js"
let server;
const app = express()
export let resSTT;
const FFPLAY = "C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffplay.exe"

async function coreHamdler() {
    app.use(express.json())
    server = app.post("/stt", async (req, res) => {
        console.log("RESTT BELUM MENERIMA DATA...")
        resSTT = req.body.text
        //const resAudConvert = await extrAudio(resSTT)
        //await playAudio(resAudConvert)
        console.log(resSTT)
        console.log("data terkirim...")
        res.sendStatus(200)
        console.log(" Kirim ke audioplayer...")
        try{
            const resToAudioPlayer = await fetch("http://192.168.1.9:3555/audioPlayerPC", {
            method: "POST",
            headers: {
                "Content-Type":"Application/json"
            },
            body:JSON.stringify({
                text: resSTT
            })
        })
        console.log("audioplayer res", resToAudioPlayer.status)
    } catch(error) {
        console.error("audioplayer ERROR", error.message)
    }
        
        console.log("SUCCESS...")
    })
}
coreHamdler()

app.listen(3000, () => {
    console.log("ZARVIS server running on port 3000...")
})


server.on("close", () => {
    console.log("SERVER CLOSED")
})

process.on("beforeExit", code => {
    console.log("BEFORE EXIT:", code)
})

process.on("exit", code => {
    console.log("EXIT:", code)
})


console.log("SETELAH APP.LISTEN...")


// AI activation cmds >> .\llama-server.exe -m "C:\Users\User\Desktop\ZARVIS\LLM\LLM Models\qwen2.5-1.5b-instruct-q4_k_m.gguf" --host 127.0.0.1 --port 8081
export async function Fetching(input) {
    try {
    const fetchVal = await fetch("http://192.168.1.8:20128/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization":`Bearer ${process.env.NINE_ROUTER_API_KEY}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            model: "combo-gemini",
            messages: [
                {
                    role: "system",
                    content: process.env.AI_SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: input 
                }
            ],
            stream: false
        })
    })
    console.log(process.env.NINE_ROUTER_API_KEY ? "API KEY KEBACA" : "API KEY TIDAK KEBACA")
    const response = 
    console.log("STATUS:", fetchVal.status)
    console.log("OK:", fetchVal.ok)
    console.log("9ROUTER RAW:", response)

    if (!fetchVal.ok) {
        throw new Error(
            response.error?.message ||
            response.message ||
            `9ROUTER HTTP ${fetchVal.status}`
        )
    }
    

    const content = response.choices?.[0]?.message?.content

    console.log("AI RAW:", content)

    if (!content) {
        throw new Error("Response 9router tidak terkirim..")
    }

    return content
    } catch (error) {
        console.error("FETCHING ERROR", error)
        throw error
    }
}


export async function webSearch(query) {
    const fetchVal = await fetch("http://192.168.1.8:20128/v1/search", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.NINE_ROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "tavily",
                query: query,
                max_results: 5,
                domain_filter: [
                    "youtube.com",
                    "youtu.be"
                ]
            })
        })

        const data = await fetchVal.json()
        console.log("SEARCH:", data)

        const result = data.results?.find((item) => {
            try {
                const host = new URL(item.url).hostname
                return host === "youtube.com" || host ==="www.youtube.com" || host === "youtu.be"
            } catch {
                return false
            }
        })
        
        if (!result) {
            throw new Error("Video yt tidak ditemukan")
        }

        return result.url
}




export async function extrAudio(input) {
    const objjson = {
        text: input
    }
    const res =  await fetch("http://192.168.1.9:5000/tts", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(objjson)
    })
    console.log("JSON dikirim...")

    const arrBuffer = await res.arrayBuffer()
    const bufferOut = Buffer.from(arrBuffer)

    return bufferOut
}



export function playAudioTTS(buffer) {
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

export function playMusic(url) {
    const yt = spawn("yt-dlp", [
        "-f", "bestaudio",
        "-o", "-",
        url
    ])

    const player = spawn("ffplay", [
        "-nodisp", 
        "-autoexit",
        "-"
    ])

    yt.stdout.pipe(player.stdin)
    player.stderr.on("data", (data) => {
        process.stdout.write(data)
    })
}

