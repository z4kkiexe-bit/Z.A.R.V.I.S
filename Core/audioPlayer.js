import { extrAudio, playMusic, playAudioTTS, resSTT, Fetching } from "./Core";

export const STT = {
    async sttToAi() {
        const sttInputAi = await Fetching(resSTT)
        
        const sttOutputAi = await extrAudio(sttInputAi)
        await playAudio(sttOutputAi)
    },

    async sttToMusic() {
        const sttInputAi = resSTT.toLowerCase()
        const arrMusic = [
            {
                Megalovania: "https://youtu.be/63cYJbgwkoQ"
            },
            {
                NASA: "https://youtu.be/JL7ScHIyQ38"
            },
            {
                ForgetMeNot: "https://youtu.be/ojniEg2IcgE"
            },
            {
                FallFromSky: "https://youtu.be/Kqmzbpa7_6w"
            },
            {
                StepUp: "https://youtu.be/uAD5E1lqmXw"
            }
        ]
        
        if (sttInputAi.includes("nia")) {
            const templateRes = await extrAudio("Siap, lagu akan diputar!")
            await playAudioTTS(templateRes)
            playMusic(arrMusic[0].Megalovania)
        }
        if (sttInputAi.includes("anymore")) {
            const templateRes = await extrAudio("Siap, lagu akan diputar!")
            await playAudioTTS(templateRes)
            playMusic(arrMusic[1].NASA)
        }
        if (sttInputAi.includes("forget")) {
            const templateRes = await extrAudio("Siap, lagu akan diputar!")
            await playAudioTTS(templateRes)
            playMusic(arrMusic[2].ForgetMeNot)
        }
        if (sttInputAi.includes("fall")) {
            const templateRes = await extrAudio("Siap, lagu akan diputar!")
            await playAudioTTS(templateRes)
            playMusic(arrMusic[3].FallFromSky)
        }
        if (sttInputAi.includes("step")) {
            const templateRes = await extrAudio("Siap, lagu akan diputar!")
            await playAudioTTS(templateRes)
            playMusic(arrMusic[4].StepUp)
        }
    }
}
STT.sttToMusic()