import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason
} from "@whiskeysockets/baileys";

import QRCode from "qrcode";


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
            console.log(`Ada pesan masuk...\n${conv ?? "[non-text message]"}` );
            const remoteJid = inputMsg.key.remoteJid;
            
            if (!remoteJid) {
                continue;
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

            if (conv?.startsWith("#calc=>")) {
                const [cmds, args] = conv.split(">")
                // replace eval sometimes
                const inputval = String(eval(args))
                await sock.sendMessage(remoteJid, {
                    text: inputval
                })
            }

            if (conv?.startsWith("#whoami")) {
                await sock.sendMessage(remoteJid, {
                    text: ` ZARVIS \nName    : ZARVIS\nExt : Zak's Assistant Remote Vision\nOwner   : Zakki\nVersion : v1.0.0 Beta\nCore    : Node.js\nPlatform: WhatsApp\nStatus  : Online\n
                            `
                })
            }

            if (conv?.startsWith("#Help")) {
                await sock.sendMessage(remoteJid, {
                    text:`Available cmds\n#tuff\n#calc=> (Angka + Angka)\n#whoami\n#menu`
                })
            }

            if (conv?.startsWith("tuff")) {
                await sock.sendMessage(remoteJid, {
                    text: "the BIMZ"
                    }
                );
            }
        }
    })
}


connectToWhatsApp();