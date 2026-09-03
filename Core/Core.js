import "../Whatsapp/Whatsapp.js"
import http from "http"

const server = http.createServer((req, res) => {
    res.end("ZARVIS SERVER ONLINE")
})

server.listen(3000, () => {
    console.log("ZARVIS server running on port 3000...")
}) 

export async function Fetching(input) {
    const fetchVal = await fetch("http://127.0.0.1:8081/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type":"Application/json"
        },
        body:JSON.stringify(input)
    })

    const response = await fetchVal.json()

    return response.choices[0].message.content
}
/*async function renderRes() {
    const result = await Fetching({
            messages: [{
                role: "user",
                content: "Haloo, siapa namamu?"
            }]
    })
    console.log(result)
}
renderRes()*/