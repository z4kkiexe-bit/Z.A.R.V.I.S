import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    downloadMediaMessage,
    extractAddressingContext
} from "@whiskeysockets/baileys";
import { evaluate } from "mathjs"
import QRCode from "qrcode";
import { Fetching, extrAudio, playAudio } from "../Core/Core.js"


const expressions = ["Sigma😎", "Skibidi😰", "Rizz🤣", "Folk valley🥶", "Mewing🥵"]
const myJid = "241394962710673@lid"

function setDelay(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    })
}


async function connectToWhatsApp() {

    const { state, saveCreds } =
        await useMultiFileAuthState("./auth");


    const sock = makeWASocket({
        auth: state
    });


    sock.ev.on("creds.update", saveCreds);



    sock.ev.on("connection.update", async (update) => {

        const {
            connection,
            lastDisconnect,
            qr
        } = update;


        if (qr) {

            console.log("QR diterima. Membuat PNG...");

            try {

                await QRCode.toFile(
                    "./zarvis-qr.png",
                    qr,
                    {
                        width: 800,
                        margin: 2,
                        errorCorrectionLevel: "H"
                    }
                );

                console.log(
                    "QR berhasil dibuat:"
                );

                console.log(
                    "C:\\Users\\User\\Desktop\\ZARVIS\\zarvis-qr.png"
                );

            } catch (error) {

                console.error(
                    "Gagal membuat QR:",
                    error
                );
            }
        }



        if (connection === "open") {

            console.log(
                "ZARVIS connected to WhatsApp."
            );
        }



        if (connection === "close") {
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            console.log("WhatsApp connection closed.");
            console.log("Status code:", statusCode);

            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log("WhatsApp connection closed.");
            if (shouldReconnect) {
                console.log("Mencoba reconnect...");
                connectToWhatsApp();
            } else {
                console.log("WhatsApp logged out. Hapus auth lalu scan ulang.");
            }
        }

    });




    sock.ev.on("messages.upsert", async ({ messages }) => {
        for (const inputMsg of messages) {
            if (!inputMsg?.message) {
                continue;
            }
            const conv =  inputMsg.message.conversation;
            const timestamp = new Date().toLocaleDateString("id-ID", { timezone: "Asia/Jakarta"})

            console.log(`Ada pesan masuk...\n${conv ?? "[non-text message]"}` );
            const remoteJid = inputMsg.key.remoteJid;
            console.log(remoteJid)
            
            if (!remoteJid) {
                continue;
            }
            
            if (inputMsg.key.fromMe) {
                continue
            }


            if (conv?.startsWith("#menu")) {
                /*if (!inputMsg.key.fromMe) {
                    return
                }*/
                await sock.sendMessage(remoteJid, {
                        text:
                            "WELCOME TO THE ZARVIS PROJECT"
                    }
                );
            }

            if (conv?.startsWith("#cal =>")) {
                try{
                    const [cmds, args] = conv.split(">")
                    const inputval = String(evaluate(args)) 
                    await sock.sendMessage(remoteJid, {
                        text: inputval 
                })
            } catch(error) {
                await sock.sendMessage(remoteJid, {
                    text: "MATH ONLY!!"
                })
            }
            }

            if (conv?.startsWith("#whoami")) {
                await sock.sendMessage(remoteJid, {
                    text: ` ZARVIS \nName    : ZARVIS\nExt : Zak's Assistant Remote Vision\nOwner   : Zakki\nVersion : v1.0.0 Beta\nCore    : Node.js\nPlatform: WhatsApp\nStatus  : Online\n
                            `
                })
            }

            if (conv?.startsWith("#help")) {
                await sock.sendMessage(remoteJid, {
                    text:`Available cmds\n#tuff\n#cal => (angka (operator) angka)\n#whoami\n#menu\n#aura\n#checkName\n#ai => (input)\n#audiovert => (Teks yang ingin konversi)\n#narrator => (teks)`
                })
            }

            if (conv?.startsWith("#tuff")) {
                for (let i = 0; i <= 4; i++) {
                    const valueInt = await sock.sendMessage(remoteJid, {
                    text: `${ expressions[i]}`
                    }
                );
            }
            }

            if (conv?.startsWith("#aura")) {
                const random = Math.floor(Math.random() * expressions.length)
                await sock.sendMessage(remoteJid, {
                    text: `${inputMsg.pushName} sangat ${expressions[random]}`
                })
            }

            if (conv?.startsWith("#checkName")) {
                await sock.sendMessage(remoteJid, {
                    text: `Nama mu: ${inputMsg.pushName}\nNomor: ${remoteJid}\nWaktu: ${timestamp}`
                })
            }

            if (conv?.startsWith("#ai =>")) {
                try{
                    const [cmds, args] = conv.split(">")
                    const loadRes = await sock.sendMessage(remoteJid, {
                            text: "Loading response..."
                        })
                    const value = await Fetching(args.trim())

                    const sendAI = await sock.sendMessage(remoteJid, {
                        text: `ZARVIS-AI-SERVICES:\n${value}`,
                    })
                    //const audData = await extrAudio(value)
                    //await playAudio(audData)
                    console.log("SEBELUM EDIT...")
                    try{
                        const loadSuccess = await sock.sendMessage(remoteJid, {
                            text: "Response loaded! ✔",
                            edit: loadRes.key
                        })
                    } catch(error) {
                        console.error("Gagal edit loading", error)
                    }
                    console.log("SETELAH EDIT...")
                    
            } catch(error) {
                await sock.sendMessage(remoteJid, {
                    text: "REQUEST AI GAGAL"
                })
            }
            }

            if (conv?.startsWith("#audiovert =>")) {
                console.log("MASUK IF AUDIO")
                try{
                    const [, args] = conv.split(">")
                    const Aud = await extrAudio(args.trim())

                    console.log("Audio type:", Aud.constructor.name)
                    console.log("Audio size:", Aud.length)
                    console.log("Audio header:", Aud.subarray(0, 12).toString())

                    const sent = await sock.sendMessage(remoteJid, {
                        audio: Aud,
                        mimetype: "audio/ogg; codecs=opus",
                    })
                    console.log("HASIL SENT")
                    console.log(sent)
                    console.log("AUDIO TERKIRIM")
                    } catch(error) {
                        console.error("ERROR FETCHING AUDIO", error)
                        await sock.sendMessage(remoteJid, {
                            text: "ERROR FETCHING AUDIO"
                        })
                    }
                }
            

            if (conv?.startsWith("#narrator =>")) {
                const [, args] = conv.split(">")
                const narrValInput = await extrAudio(args.trim())
                await playAudio(narrValInput)
                await sock.sendMessage(remoteJid, {
                    text: args
                })
            }
        }

    })
// BAGIAN LOGIC TANPA MSG UPSERT / LOGIC SECTION WITHOUT MSG UPSERT
}
connectToWhatsApp()