import "../Whatsapp/Whatsapp.js"
import http from "http"

const server = http.createServer((req, res) => {
    res.end("ZARVIS SERVER ONLINE")
})

server.listen(3000, () => {
    console.log("ZARVIS server running on port 3000...")
}) 