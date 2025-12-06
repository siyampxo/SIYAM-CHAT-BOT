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
        "fetching": "⏳ Fetching info for UID: %1...",
        "result": "🧑‍💻 Player Info\n├─ Name: %1\n├─ UID: %2\n├─ Status: %3",
        "error": "❌ Error fetching info: %1",
        "bannedText": "⚠️ Your Free Fire ID is *BANNED*.\n📹 Watch the video below for details.",
        "notBannedText": "✅ Your Free Fire ID is *NOT BANNED*.\n📹 Watch the video below for details."
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
    const BANNED_VIDEO = "https://drive.google.com/uc?export=download&id=1QGd1PwGGO_oiJHxAjA-PTEYot0IDXhNC";
    const NOT_BANNED_VIDEO = "https://drive.google.com/uc?export=download&id=1hEvjeU66_3YgcsQFCaJNze8H020J6Teg";

    if (!args[0])
        return api.sendMessage(getText("noArgs", { prefix: global.config.PREFIX }), threadID, messageID);

    const UID = args[0];
    api.sendMessage(getText("fetching", UID), threadID, messageID);

    try {
        // 1️⃣ Get Player Name
        const dangerRes = await axios.get(`https://danger-info-alpha.vercel.app/accinfo?uid=${UID}&key=DANGERxINFO`);
        const playerName = escape_md(dangerRes.data.basicInfo?.nickname || "Unknown");

        // 2️⃣ Get Ban Status
        const banRes = await axios.get(`http://amin-team-api.vercel.app/check_banned?player_id=${UID}`);
        const status = banRes.data.status || "Unknown";

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

        // 5️⃣ SEND TEXT + VIDEO TOGETHER IN ONE MESSAGE
        api.sendMessage({
            body: finalText,
            attachment: fs.createReadStream(videoPath)
        }, threadID, () => fs.unlinkSync(videoPath));

    } catch (err) {
        api.sendMessage(getText("error", err.message), threadID, messageID);
    }
};
