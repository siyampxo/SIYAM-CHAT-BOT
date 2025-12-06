module.exports.config = {
    name: "check",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ONLY SIYAM BOT TEAM ☢️ (Modified by ChatGPT)",
    description: "Check Free Fire player info + ban status with video response",
    commandCategory: "game",
    usages: "[UID]",
    cooldowns: 5
};

module.exports.languages = {
    "en": {
        "noArgs": "❌ Please enter UID. Example: %prefix%check 903437692",
        "fetching": "⏳ Checking Account Status for UID: %1...",
        "result": "👤 𝙋𝙇𝘼𝙔𝙀𝙍 𝙄𝙉𝙁𝙊\n├─ 𝙉𝘼𝙈𝙀: %1\n├─ 𝙐𝙄𝘿: %2\n├─ 𝙎𝙏𝘼𝙏𝙐𝙎: %3",
        "error": "❌ Error fetching info: %1",
        "bannedText": "⚠️ 𝚃𝙷𝙸𝚂 𝔽𝕣𝕖𝕖 𝔽𝕚𝕣𝕖 𝙰𝙲𝙲𝙾𝚄𝙽𝚃 𝙸𝚂 *𝐁𝐀𝐍𝐍𝐄𝐃*.",
        "notBannedText": "✅ 𝚃𝙷𝙸𝚂 𝔽𝕣𝕖𝕖 𝔽𝕚𝕣𝕖 𝙰𝙲𝙲𝙾𝚄𝙽𝚃 𝙸𝚂 *𝐍𝐎𝐓 𝐁𝐀𝐍𝐍𝐄𝐃*."
    }
};

function escape_md(text) {
    if (!text) return "Unknown";
    return text.toString()
        .replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

module.exports.run = async function({ api, event, args, getText }) {
    const axios = require("axios");
    const fs = require("fs");
    const { threadID, messageID } = event;

    // Google Drive Direct Links
    const BANNED_VIDEO = "https://drive.google.com/uc?export=download&id=1leWQG3MYoz9md0wlWGyWcSdav252vEX9";
    const NOT_BANNED_VIDEO = "https://drive.google.com/uc?export=download&id=1q47rdgdVGpmY5vIilo5-v15cxItMjc3Y";

    if (!args[0])
        return api.sendMessage(getText("noArgs", { prefix: global.config.PREFIX }), threadID, messageID);

    const UID = args[0];
    api.sendMessage(getText("fetching", UID), threadID, messageID);

    let playerName = "Unknown"; // default
    let status = "Unknown";     // default

    try {
        // 1️⃣ Try to get player name from Danger API
        try {
            const dangerRes = await axios.get(`https://danger-info-alpha.vercel.app/accinfo?uid=${UID}&key=DANGERxINFO`);
            playerName = escape_md(dangerRes.data.basicInfo?.nickname || "Unknown");
        } catch (err) {
            // API down → use "Unknown"
            playerName = "Unknown";
        }

        // 2️⃣ Try to get ban status
        try {
            const banRes = await axios.get(`http://amin-team-api.vercel.app/check_banned?player_id=${UID}`);
            status = banRes.data.status || "Unknown";
        } catch (err) {
            status = "Unknown";
        }

        // 3️⃣ Prepare message text
        const infoText = getText("result", playerName, UID, status);
        const extraText =
            status.toLowerCase() === "banned"
                ? getText("bannedText")
                : getText("notBannedText");

        const finalText = infoText + "\n\n" + extraText;

        // 4️⃣ Download correct video
        const videoPath = __dirname + `/check_${UID}.mp4`;
        const videoURL = status.toLowerCase() === "banned" ? BANNED_VIDEO : NOT_BANNED_VIDEO;

        const response = await axios.get(videoURL, { responseType: "arraybuffer" });
        fs.writeFileSync(videoPath, Buffer.from(response.data));

        // 5️⃣ Send text + video together
        api.sendMessage({
            body: finalText,
            attachment: fs.createReadStream(videoPath)
        }, threadID, () => fs.unlinkSync(videoPath));

    } catch (err) {
        // Any unexpected error
        api.sendMessage(getText("error", err.message), threadID, messageID);
    }
};
